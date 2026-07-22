import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import type { Project } from '../types';
import { iframeScript } from '../assets/assets';
import EditorPanel from './EditorPanel';
import LoaderSteps from './LoaderSteps';

interface ProjectPreviewProps {
    project: Project;
    isGenerating: boolean;
    device?: 'desktop' | 'tablet' | 'phone';
    showEditorPanel?: boolean;
}

export interface ProjectPreviewRef {
    getCode: () => string | undefined;

}

const ProjectPreview = forwardRef<ProjectPreviewRef, ProjectPreviewProps>(({ project, isGenerating, device = 'desktop', showEditorPanel = true }, ref) => {

    const iframeRef = useRef<HTMLIFrameElement>(null)

    const [selectedElement, setSelectedElement] = useState<any>(null)

    const resolutions = {
        phone: 'w-[412px]',
        tablet: 'w-[768px]',
        desktop: 'w-full'
    }

    useImperativeHandle(ref, ()=>({
        getCode: ()=>{
            const doc = iframeRef.current?.contentDocument;
            if (!doc) return undefined      

            // remove our selection class atrributes and styles before returning 
            doc.querySelectorAll('.ai-selected-element,[data-ai-selected]').forEach(el=>{
                el.classList.remove('ai-selected-element');
                el.removeAttribute('data-ai-selected');
                (el as HTMLElement).style.outline = '';
            })
            // remove injected style and script from the document
            const previewStyle = doc.getElementById('ai-preview-style');
            if(previewStyle) previewStyle.remove();

            const previewScript = doc.getElementById('ai-preview-script');
            if(previewScript) previewScript.remove();

            // serialise clean html
            const html = doc.documentElement.outerHTML;
            return html;
        }
    }))

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data.type === 'ELEMENT_SELECTED') {
                setSelectedElement(event.data.payload);
            } else if (event.data.type === 'CLEAR_SELECTION') {
                setSelectedElement(null)
            }
        }
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage)

    }, [])

    const handleUpdate = (updates: any)=>{
        if (iframeRef.current?.contentWindow) {
            iframeRef.current?.contentWindow.postMessage({
                type: 'UPDATE_ELEMENT',
                payload: updates
            }, '*');
        }
    }

    const injectPreview = (html: string) => {
        if (!html) return '';
        if (!showEditorPanel) return html
        if (!html.includes('</body>')) {
            return html.replace('</body>', iframeScript + '</body>')
        } else {
            return html + iframeScript
        }
    }

    return (
        <div className="relative bg-[#08080a] h-full rounded-2xl overflow-hidden border border-[#22242c] shadow-2xl flex flex-col justify-center items-center">
            {project.current_code ? (
                <div className="relative w-full h-full flex flex-col items-center justify-center p-2 sm:p-4">
                    {/* Viewport Frame */}
                    <div className={`h-full ${resolutions[device]} transition-all duration-300 ease-in-out bg-white rounded-xl overflow-hidden shadow-2xl border border-[#22242c] relative`}>
                        <iframe
                            ref={iframeRef}
                            srcDoc={injectPreview(project.current_code)}
                            className="w-full h-full border-none bg-white" 
                        />
                    </div>

                    {showEditorPanel && selectedElement && (
                        <EditorPanel  selectedElement={selectedElement} onUpdate={handleUpdate} onClose={()=>{
                            setSelectedElement(null);
                            if(iframeRef.current?.contentWindow){
                                iframeRef.current.contentWindow.postMessage({type:'CLEAR_SELECTION_REQUEST'}, '*')
                            }
                        }}/>
                    ) }
                </div>
            ) : isGenerating && (
                <LoaderSteps/>
            )}
        </div>
    )
})

export default ProjectPreview