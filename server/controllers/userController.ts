import { Request, Response } from "express";
import prisma from "../lib/prisma.js";
import openai from "../config/openai.js";
import { pickDesignSystem } from '../config/designSystems.js';
import { sendVerificationOtpEmail } from '../lib/mailer.js';

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

        if (!user.emailVerified) {
            return res.status(403).json({ 
                message: "Please verify your email address before creating projects.",
                requiresEmailVerification: true 
            })
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

export const generateUniqueSlug = async (userId: string, name: string, currentProjectId: string): Promise<string> => {
    let baseSlug = name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s_-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');

    if (!baseSlug || baseSlug === '-') {
        baseSlug = 'project';
    }

    if (RESERVED_WORDS.includes(baseSlug)) {
        baseSlug = `${baseSlug}-site`;
    }

    let candidateSlug = baseSlug;
    let counter = 1;

    while (true) {
        const existing = await prisma.websiteProject.findFirst({
            where: {
                userId,
                slug: candidateSlug,
                NOT: { id: currentProjectId }
            }
        });

        if (!existing) {
            return candidateSlug;
        }

        counter++;
        candidateSlug = `${baseSlug}-${counter}`;
    }
};

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

        const isPublishing = !project.isPublished;
        let finalSlug = project.slug;

        if (isPublishing) {
            const nameToUse = (req.query.name as string) || req.body?.name || project.name;
            finalSlug = await generateUniqueSlug(userId, nameToUse, project.id);
        }

        const updatedProject = await prisma.websiteProject.update({
            where: {id: projectId},
            data: {
                isPublished: isPublishing,
                slug: finalSlug,
                ...(req.body?.name ? { name: req.body.name } : {})
            },
            include: {
                user: {
                    select: {
                        username: true
                    }
                }
            }
        });

        res.json({
            message: isPublishing ? 'Project Published successfully' : 'Project unpublished',
            isPublished: updatedProject.isPublished,
            slug: updatedProject.slug,
            publicUrl: updatedProject.user?.username && updatedProject.slug ? `/@${updatedProject.user.username}/${updatedProject.slug}` : null
        })

    } catch (error: any) {
        console.log(error.code || error.message);
        res.status(500).json({ message: error.message })
    }
}

// Reserved words list
export const RESERVED_WORDS = [
    'admin', 'api', 'pricing', 'settings', 'community', 'login', 'signup', 'auth', 'buildo', 'www', 'help', 'support', 'about', 'projects', 'home'
];

export const validateUsernameFormat = (username: string): { valid: boolean; error?: string } => {
    const trimmed = username.trim().toLowerCase();
    if (trimmed.length < 3 || trimmed.length > 20) {
        return { valid: false, error: 'Username must be 3-20 characters long' };
    }
    if (!/^[a-z0-9_-]+$/.test(trimmed)) {
        return { valid: false, error: 'Only lowercase letters, numbers, hyphens, and underscores allowed' };
    }
    if (RESERVED_WORDS.includes(trimmed)) {
        return { valid: false, error: 'This username is reserved' };
    }
    return { valid: true };
};

// Check username availability
export const checkUsername = async (req: Request, res: Response) => {
    try {
        const username = req.query.username as string;
        if (!username) {
            return res.status(400).json({ available: false, message: 'Username is required' });
        }
        const validation = validateUsernameFormat(username);
        if (!validation.valid) {
            return res.json({ available: false, message: validation.error });
        }

        const existing = await prisma.user.findUnique({
            where: { username: username.trim().toLowerCase() }
        });

        if (existing) {
            return res.json({ available: false, message: 'Username is already taken' });
        }

        return res.json({ available: true, message: 'Username is available' });
    } catch (error: any) {
        console.log(error.code || error.message);
        res.status(500).json({ message: error.message });
    }
};

// Get public user profile
export const getUserProfile = async (req: Request, res: Response) => {
    try {
        const username = typeof req.params.username === 'string' ? req.params.username : '';
        if (!username) {
            return res.status(400).json({ message: 'Username is required' });
        }

        const user = await prisma.user.findUnique({
            where: { username: username.trim().toLowerCase() },
            select: {
                id: true,
                name: true,
                username: true,
                createdAt: true,
            }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const projects = await prisma.websiteProject.findMany({
            where: { userId: user.id, isPublished: true },
            orderBy: { updatedAt: 'desc' },
            select: {
                id: true,
                name: true,
                slug: true,
                initial_prompt: true,
                current_code: true,
                isPublished: true,
                createdAt: true,
                updatedAt: true,
            }
        });

        res.json({ user, projects });
    } catch (error: any) {
        console.log(error.code || error.message);
        res.status(500).json({ message: error.message });
    }
};

// Send Email Verification OTP
export const sendEmailOtp = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized user" });
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.emailVerified) {
            return res.json({ success: true, message: "Email is already verified" });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

        await prisma.user.update({
            where: { id: userId },
            data: { emailOtp: otp, emailOtpExpires: expires }
        });

        // Send OTP email via Nodemailer
        await sendVerificationOtpEmail(user.email, otp, user.name);

        return res.json({ 
            success: true, 
            message: `Verification OTP code sent to ${user.email}`
        });
    } catch (error: any) {
        console.log(error.code || error.message);
        res.status(500).json({ message: error.message });
    }
};

// Verify Email OTP Code
export const verifyEmailOtp = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized user" });
        }

        const { otp } = req.body;
        if (!otp || typeof otp !== 'string') {
            return res.status(400).json({ message: "OTP code is required" });
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.emailVerified) {
            return res.json({ success: true, message: "Email is already verified" });
        }

        if (!user.emailOtp || user.emailOtp !== otp.trim()) {
            return res.status(400).json({ message: "Invalid verification code. Please check and try again." });
        }

        if (user.emailOtpExpires && user.emailOtpExpires < new Date()) {
            return res.status(400).json({ message: "Verification code has expired. Please request a new code." });
        }

        await prisma.user.update({
            where: { id: userId },
            data: { 
                emailVerified: true, 
                emailOtp: null, 
                emailOtpExpires: null 
            }
        });

        return res.json({ success: true, message: "Email verified successfully!" });
    } catch (error: any) {
        console.log(error.code || error.message);
        res.status(500).json({ message: error.message });
    }
};

// Set Username for pre-existing users
export const setInitialUsername = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized user" });
        }

        const { username } = req.body;
        if (!username || typeof username !== 'string') {
            return res.status(400).json({ message: "Username is required" });
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.username) {
            return res.status(400).json({ message: "Username has already been set for this account" });
        }

        const validation = validateUsernameFormat(username);
        if (!validation.valid) {
            return res.status(400).json({ message: validation.error });
        }

        const existing = await prisma.user.findUnique({
            where: { username: username.trim().toLowerCase() }
        });

        if (existing) {
            return res.status(400).json({ message: "Username is already taken" });
        }

        const updated = await prisma.user.update({
            where: { id: userId },
            data: { username: username.trim().toLowerCase() }
        });

        return res.json({ success: true, message: "Username set successfully!", username: updated.username });
    } catch (error: any) {
        console.log(error.code || error.message);
        res.status(500).json({ message: error.message });
    }
};

// Get current user profile status
export const getCurrentUserStatus = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized user" });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                username: true,
                emailVerified: true,
                credits: true,
            }
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.json({ user });
    } catch (error: any) {
        console.log(error.code || error.message);
        res.status(500).json({ message: error.message });
    }
};

// Get user transaction history & credits
export const getUserTransactions = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized user" });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { credits: true }
        });

        const transactions = await prisma.transaction.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });

        return res.json({
            credits: user?.credits || 0,
            transactions
        });
    } catch (error: any) {
        console.log(error.code || error.message);
        res.status(500).json({ message: error.message });
    }
};

// controller to puchase credits    
export const purchaseCredits = async (req: Request, res: Response) => {
    
}