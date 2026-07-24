import {Request, Response} from 'express'
import prisma from '../lib/prisma.js'
import openai from '../config/openai.js'
import { getSetting, getSettingInt, incrementOpenrouterCounter } from '../lib/settings.js'

// controller funct to make revision

export const makeRevision = async (req: Request, res: Response) => {

    const userId = req.userId;

    try {

        const {projectId} = req.params;
        if (typeof projectId !== 'string') {
            return res.status(400).json({ message: "Invalid project ID" })
        }
        const {message} = req.body;

        const user = await prisma.user.findUnique({
            where: { id: userId }
        })

        if (!userId || !user) {
            return res.status(401).json({ message: "Unauthorized user" })
        }

        const creditsPerRevision = await getSettingInt('creditsPerRevision');
        if(user.credits < creditsPerRevision){
            return res.status(403).json({message: "Insufficient credits. Add credits to make revisions."})
        }

        if (!message || message.trim() === '') {
            return res.status(400).json({ message: "Please provide a valid prompt" })
        }

        const currentProject = await prisma.websiteProject.findUnique({
            where: { id: projectId, userId },
            include: {versions: true}
        })

        if (!currentProject) {
            return res.status(404).json({ message: "Project not found" })
        }

        await prisma.conversation.create({
            data: {
                role: 'user',
                content: message,
                projectId
            }
        })

        await prisma.user.update({
            where: {id: userId},
            data: { credits: {decrement: creditsPerRevision} }
        })

        // Track OpenRouter request for dashboard counter
        await incrementOpenrouterCounter();
        const activeModel = await getSetting('activeModel');

        // enhance user prompt
        const promptEnhanceResponse = await openai.chat.completions.create({
            model: activeModel,
            messages:[
                {
                    role: 'system',
                    content: `
                   You are a prompt enhancement specialist. The user wants to make changes to their website. Enhance their request to be more specific and actionable for a web developer.

                    This tool generates marketing and presence websites for small businesses, local shops, cafes, portfolios, and personal brands — NOT web applications, dashboards, or tools requiring backend logic, user accounts, or databases. If the user's request implies app-like functionality, reinterpret it as a marketing/informational site feature that would help that business or person get discovered and contacted.

                    When enhancing, prioritize:
                    - A clear value proposition and what the business/person offers
                    - Sections that drive real outcomes for this type of site: contact info, location/hours (if local business), testimonials/social proof, a clear call-to-action (book, call, message, view menu, view portfolio)
                    - Tone and visual direction that fits the specific business type

                    Enhance this by:
                    1. Being specific about what elements to change
                    2. Mentioning design details (colors, spacing, sizes)
                    3. Clarifying the desired outcome
                    4. Using clear technical terms

                    Return ONLY the enhanced request, nothing else. Keep it concise (1-2 sentences).
                    `
                },
                {
                    role : 'user',
                    content: `User's request: "${message}"`
                }
            ]
            
        })

        const enhancedPrompt = promptEnhanceResponse.choices[0].message.content;

        await prisma.conversation.create({
            data: {
                role: 'assistant',
                content: `Enhanced request: "${enhancedPrompt}"`,
                projectId
            }
        })
        await prisma.conversation.create({
            data: {
                role: 'assistant',
                content: 'Now making changes to your website...',
                projectId
            }
        })

        // Track second OpenRouter request (revision code gen)
        await incrementOpenrouterCounter();
        const codeGenerationResponse = await openai.chat.completions.create({
            model: activeModel,
            messages: [
                {
                    role: 'system',
                    content: `
                    You are an expert front-end developer making a targeted revision to an existing website.

This is a MARKETING/PRESENCE website, not a web application. Do not generate: login forms, user dashboards, database-dependent features, multi-step checkout flows, or anything implying server-side logic beyond simple form submission. Every element on the page must be genuinely functional as static HTML/CSS/JS — no fake buttons that look interactive but do nothing.

Appropriate real interactivity for this site type: mobile nav toggle, smooth scroll, image gallery/lightbox, FAQ accordion, contact form with client-side validation (submits via mailto: or a simple form action, not a backend), testimonial carousel, simple filtering (e.g. menu categories, portfolio tags).

Include, where relevant to the business type:
- A clear, prominent CTA appropriate to the business (Call Now, Book a Table, View Menu, Get in Touch, View Portfolio)
- If it's a local business (cafe, shop): address, hours, a Google Maps embed placeholder, a WhatsApp click-to-chat link (https://wa.me/{phone}) as a real, working element
- Structured data: include relevant schema.org JSON-LD (LocalBusiness, Person, or Organization type depending on context) for SEO

CRITICAL REQUIREMENTS:
- Return ONLY the complete updated HTML code with the requested change applied.
- Preserve all existing sections and content that weren't part of the request — do not regenerate the whole page from scratch, only modify what was asked.
- Keep using Tailwind CSS for all styling (no custom CSS).
- Maintain the existing color palette and font choices already in the code unless the request specifically asks to change them.
- Keep all JavaScript in a single <script> tag before closing </body>.
- Return complete, standalone HTML — nothing else, no markdown, no explanation.

Apply the requested changes while keeping the rest of the site visually and structurally consistent with what's already there.
                    `
                },
                {
                    role : 'user',
                    content: `Here is the current website code:\n\n${currentProject.current_code}\n\nThe user wants this change: ${enhancedPrompt}`
                }
            ]
        })

        const code = codeGenerationResponse.choices[0].message.content || '' ;

        if (!code) {
            await prisma.conversation.create({
            data: {
                role: 'assistant',
                content: "Unable to generate the code, please try again",
                projectId
            }
        })
        await prisma.user.update({
            where: {id: userId},
            data: { credits: {increment: creditsPerRevision} }
        })
        return;
        }

        const cleanCode = code
            .replace(/```[a-z]*\n?/gi, '')
            .replace(/```$/gi, '')
            .replace(/\\"/g, '"')
            .trim();

        const version = await prisma.version.create({
            data : {
                code: cleanCode,
                description: 'Changes made',
                projectId
            }
        })

        await prisma.conversation.create({
            data: {
                role: 'assistant',
                content: "I have made the changes to your website! You can now preview it",
                projectId
            }
        })

        await prisma.websiteProject.update({
            where: {id: projectId},
            data: {
                current_code: cleanCode,
                current_version_index: version.id
            }
        })
        
        
        res.json({ message: 'Changes made successfully' })

    } catch (error: any) {
        const creditsPerRevision = await getSettingInt('creditsPerRevision');
        await prisma.user.update({
            where: {id: userId},
            data: { credits: {increment: creditsPerRevision} }
        })

        console.log(error.code || error.message);
        res.status(500).json({ message: error.message })
    }
}

//  controller funct to roll back to previous version
export const rollbackToVersion = async (req: Request, res: Response) => {

    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" })
        }

        const { projectId, versionId } = req.params;
        if (typeof projectId !== 'string' || typeof versionId !== 'string') {
            return res.status(400).json({ message: "Invalid project ID or version ID" })
        }

        const project = await prisma.websiteProject.findUnique({
            where : {id: projectId, userId},
            include: {versions: true}
        })

        if (!project) {
            return res.status(404).json({ message: "Project not found" })
        }

        const version = project.versions.find((version)=>version.id === versionId)
        

        if (!version) {
            return res.status(404).json({ message: "Invalid version" })
        }

        await prisma.websiteProject.update({
            where: {id: projectId, userId},
            data: {
                current_code: version.code,
                current_version_index: version.id
            }
        })

        await prisma.conversation.create({
            data: {
                role: 'assistant',
                content: "Changes rolled back successfully",
                projectId
            }
        })

        res.json({message: 'Version rolled back successfully'})
        
    } catch (error: any) {
        console.log(error.code || error.message);
        res.status(500).json({ message: error.message })
    }
    
}

// controller funct to delete project
export const deleteProject = async (req: Request, res: Response) => {

    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" })
        }

        const { projectId } = req.params;
        if (typeof projectId !== 'string') {
            return res.status(400).json({ message: "Invalid project ID" })
        }


        await prisma.websiteProject.delete({
            where : {id: projectId, userId}
        })

        res.json({message: 'Project deleted successfully'})
        
    } catch (error: any) {
        console.log(error.code || error.message);
        res.status(500).json({ message: error.message })
    }
    
}

// controller for getting project code for preview
export const getProjectPreview = async (req: Request, res: Response) => {

    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" })
        }

        const { projectId } = req.params;
        if (typeof projectId !== 'string') {
            return res.status(400).json({ message: "Invalid project ID" })
        }

        const project = await prisma.websiteProject.findFirst({
            where : {id: projectId, userId},
            include: {versions: true}
        })

        if (!project) {
            return res.status(404).json({ message: "Project not found" })
        }

        res.json({project})
        
    } catch (error: any) {
        console.log(error.code || error.message);
        res.status(500).json({ message: error.message })
    }
    
}

// controller funct to get published projects
export const getPublishedProjects = async (req: Request, res: Response) => {

    try {

        const projects = await prisma.websiteProject.findMany({
            where : {isPublished: true},
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                    }
                }
            },
            orderBy: [
                { featured: 'desc' },
                { updatedAt: 'desc' }
            ]
        })

        res.json({projects})
        
    } catch (error: any) {
        console.log(error.code || error.message);
        res.status(500).json({ message: error.message })
    }
    
}

// controller funct to get single project bu id
export const getProjectById = async (req: Request, res: Response) => {

    try {

        const {projectId} = req.params;
        if (typeof projectId !== 'string') {
            return res.status(400).json({ message: "Invalid project ID" })
        }

        const project = await prisma.websiteProject.findFirst({
            where : {id: projectId},
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                    }
                }
            }
        })

        if (!project || project.isPublished === false || !project?.current_code) {
            return res.status(404).json({message : "Project not found"})
        }

        res.json({code: project.current_code, project })
        
    } catch (error: any) {
        console.log(error.code || error.message);
        res.status(500).json({ message: error.message })
    }
    
}

// controller func to get project by username and slug
export const getProjectByUsernameAndSlug = async (req: Request, res: Response) => {
    try {
        const username = typeof req.params.username === 'string' ? req.params.username : '';
        const slug = typeof req.params.slug === 'string' ? req.params.slug : '';
        if (!username || !slug) {
            return res.status(400).json({ message: "Invalid parameters" });
        }

        const user = await prisma.user.findUnique({
            where: { username: username.trim().toLowerCase() }
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const project = await prisma.websiteProject.findFirst({
            where: { userId: user.id, slug: slug.trim().toLowerCase(), isPublished: true },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                    }
                }
            }
        });

        if (!project || !project.current_code) {
            return res.status(404).json({ message: "Project not found" });
        }

        res.json({ code: project.current_code, project });
    } catch (error: any) {
        console.log(error.code || error.message);
        res.status(500).json({ message: error.message });
    }
};

// controller to save the project

export const saveProjectCode = async (req: Request, res: Response) => {

    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" })
        }

        const {projectId} = req.params;
        const {code} = req.body;

        if (typeof projectId !== 'string') {
            return res.status(400).json({ message: "Invalid project ID" })
        }

        if (!code) {
            return res.status(400).json({ message: "Code is required" })
        }

        const project = await prisma.websiteProject.findUnique({
            where: {id: projectId, userId}
        })

        if (!project) {
            return res.status(404).json({message : "Project not found"})
        }

        await prisma.websiteProject.update({
            where: {id: projectId},
            data: {current_code: code, current_version_index: ''}
        })

        res.json({ message: 'Project saved successfully' })
        
    } catch (error: any) {
        console.log(error.code || error.message);
        res.status(500).json({ message: error.message })
    }
    
}