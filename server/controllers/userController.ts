import { Request, Response } from "express";
import prisma from "../lib/prisma.js";
import openai from "../config/openai.js";
import { pickDesignSystem } from '../config/designSystems.js';

// get user credits
export const getUserCredits = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized user" })
        }

        const user = await prisma.user.findUnique({
            where: { id: userId }
        })

        res.json({ credits: user?.credits })

    } catch (error: any) {
        console.log(error.code || error.message);
        res.status(500).json({ message: error.message })
    }
}

// controller func to create new project
export const createUserProject = async (req: Request, res: Response) => {
    const userId = req.userId;
    try {
        const { initial_prompt } = req.body;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized user" })
        }

        const user = await prisma.user.findUnique({
            where: { id: userId }
        })

        if (!user) {
            return res.status(401).json({ message: "Unauthorized user" })
        }

        if (user.credits < 5) {
            return res.status(403).json({ message: 'Insufficient credits. Add credits to create more projects.' })
        }

        // create new project
        const project = await prisma.websiteProject.create({
            data: {
                name: initial_prompt.length > 50 ?
                    initial_prompt.substring(0, 47)
                    + '...' : initial_prompt,
                userId,
                initial_prompt,
            }
        })

        // update users total creation
        await prisma.user.update({
            where: { id: userId },
            data: { totalCreation: { increment: 1 } }
        })


        await prisma.conversation.create({
            data: {
                role: 'user',
                content: initial_prompt,
                projectId: project.id
            }
        })

        await prisma.user.update({
            where: { id: userId },
            data: { credits: { decrement: 5 } }
        })

        const designSystem = pickDesignSystem(initial_prompt);
        await prisma.websiteProject.update({
            where: { id: project.id },
            data: { designSystemId: designSystem.id }
        });

        res.json({ projectId: project.id })

        // enhance user prompt

        const promptEnhanceResponse = await openai.chat.completions.create({
            model: 'cohere/north-mini-code:free',
            messages: [
                {
                    role: "system",
                    content: `
                    You are a prompt enhancement specialist. Take the user's website request and expand it into a detailed, comprehensive prompt that will help create the best possible website.

                    Enhance this prompt by:
                    1. Adding specific design details (layout, color scheme, typography)
                    2. Specifying key sections and features
                    3. Describing the user experience and interactions
                    4. Including modern web design best practices
                    5. Mentioning responsive design requirements
                    6. Adding any missing but important elements

                    Return ONLY the enhanced prompt, nothing else. Make it detailed but concise (2-3 paragraphs max).`
                },
                {
                    role: 'user',
                    content: initial_prompt
                }
            ]
        })

        const enhancedPrompt = promptEnhanceResponse.choices[0].message.content

        await prisma.conversation.create({
            data: {
                role: 'assistant',
                content: `I have enhanced your prompt to: "${enhancedPrompt}".`,
                projectId: project.id
            }
        })

        await prisma.conversation.create({
            data: {
                role: 'assistant',
                content: 'I am now generating your website, please wait...',
                projectId: project.id
            }
        })


        // generate website code
        const codeGenerationResponse = await openai.chat.completions.create({
            model: 'cohere/north-mini-code:free',
            messages: [
                {
                    role: 'system',
                    content: `
                    You are an expert front-end developer. Create a complete, production-ready, single-page website based on this request: "${enhancedPrompt}"

OUTPUT RULES:
- Output valid HTML ONLY, complete and standalone.
- Include this EXACT script in the <head>: <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
- Use semantic HTML5 elements (<header>, <nav>, <main>, <section>, <footer>) — never unlabeled divs for structural elements.
- Use https://picsum.photos/seed/{descriptive-keyword}/{width}/{height} for all images (e.g. https://picsum.photos/seed/backpack/400/400). This always returns a real photo and never breaks. Use a different seed keyword per image so photos vary.
- Write real, contextually relevant copy for every section. No lorem ipsum, no "Company Name" placeholders — use realistic content based on what the user asked for.
- Follow this design direction: choose ONE cohesive color palette (a primary, a background, and an accent used sparingly for CTAs) and stick to it throughout — don't mix random Tailwind colors section to section.
- Vary section layout — don't make every section "heading + 3 cards in a row." Mix layout patterns (split image+text, full-width stat bar, alternating columns, etc.) based on what fits the content.
- Fully responsive using sm:/md:/lg:/xl: classes — test every section mentally against mobile width.
- Include proper meta tags: title, description, viewport.
- Use Google Fonts CDN for a heading/body font pairing that fits the site's tone, not the Tailwind default.

DESIGN SYSTEM TO FOLLOW EXACTLY:
${JSON.stringify(designSystem, null, 2)}

Use the palette, fonts, spacing, radius, and component patterns above precisely — do not substitute your own colors or fonts. Follow the layoutGuidance closely; it describes what makes this design system distinct from a generic template.

Do not default to "centered heading + subtext + 3-card row" for every section. Vary structure: use split layouts, offset/asymmetric grids, full-bleed sections, and staggered content — informed by the layoutGuidance above.

CRITICAL HARD RULES:
1. Output ALL content into message.content only — nothing in reasoning/analysis/hidden fields.
2. No markdown, no code fences, no explanations — HTML only, ready to render as-is.`
                },
                {
                    role: 'user',
                    content: enhancedPrompt || ''
                }
            ]
        })

        const code = codeGenerationResponse.choices[0].message.content || '';

        if (!code) {
            await prisma.conversation.create({
            data: {
                role: 'assistant',
                content: "Unable to generate the code, please try again",
                projectId: project.id
            }
        })
        await prisma.user.update({
            where: {id: userId},
            data: { credits: {increment: 5} }
        })
        return;
        }

        // create version for project
        const cleanCode = code
            .replace(/```[a-z]*\n?/gi, '')
            .replace(/```$/gi, '')
            .replace(/\\"/g, '"')
            .trim();

        const version = await prisma.version.create({
            data:{
                code: cleanCode,
                description: 'Initial version',
                projectId: project.id
            }
        })

        await prisma.conversation.create({
            data:{
                role: 'assistant',
                content: `Your website has been generated successfully. You can view and edit it now.`,
                projectId: project.id
            }
        })

        await prisma.websiteProject.update({
            where: {id: project.id},
            data:{
                current_code: cleanCode,
                current_version_index: version.id
            }
        })

        res.json({ versionId: version.id})

        


    } catch (error: any) {
        await prisma.user.update({
            where: {id: userId},
            data: {credits: {increment: 5}}
        })
        console.log(error.code || error.message);
        if (!res.headersSent) {
            res.status(500).json({ message: error.message })
        }
    }
}

// controller func to get single user projects
export const getUserProject = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized user" })
        }

        const {projectId} = req.params;
        if (typeof projectId !== 'string') {
            return res.status(400).json({ message: "Invalid project ID" })
        }

        const project = await prisma.websiteProject.findUnique({
            where: { id: projectId, userId },
            include: {
                conversation: {
                    orderBy: {timestamp: 'asc'}
                },
                versions: {orderBy: {timestamp: 'asc'}},
            }
        })

        res.json({ project })

    } catch (error: any) {
        console.log(error.code || error.message);
        res.status(500).json({ message: error.message })
    }
}

// controller func to get all user project
export const getUserProjects = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized user" })
        }

        const projects = await prisma.websiteProject.findMany({
            where: { userId },
            orderBy: {updatedAt: 'desc'}
        })

        res.json({ projects })

    } catch (error: any) {
        console.log(error.code || error.message);
        res.status(500).json({ message: error.message })
    }
}

// controller funct to toggle published project
export const togglePublish = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized user" })
        }

        const {projectId} = req.params;
        if (typeof projectId !== 'string') {
            return res.status(400).json({ message: "Invalid project ID" })
        }

        const project = await prisma.websiteProject.findUnique({
            where: {id: projectId, userId},

        })

        if (!project) {
            return res.status(404).json({message: "Project not found"})
        }

        await prisma.websiteProject.update({
            where: {id: projectId},
            data: {isPublished: !project.isPublished}
        })

        res.json({ message: project.isPublished ? 'Project unpublished' : 'Project Published successfully' })

    } catch (error: any) {
        console.log(error.code || error.message);
        res.status(500).json({ message: error.message })
    }
}

// controller to puchase credits    
export const purchaseCredits = async (req: Request, res: Response) => {
    
}