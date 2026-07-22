import { XIcon, SlidersIcon } from 'lucide-react';
import { useState, useEffect } from 'react'

interface EditorPanelProps {
    selectedElement: {
        tagName: string;
        className: string;
        text: string;
        styles: {
            padding: string;
            margin: string;
            backgroundColor: string;
            color: string;
            fontSize: string;
        };
    } | null;
    onUpdate: (updates: any) => void;
    onClose: () => void;
};

const EditorPanel = ({ selectedElement, onUpdate, onClose }: EditorPanelProps) => {

    const [values, setValues] = useState(selectedElement)

    useEffect(() => {
        setValues(selectedElement)
    }, [selectedElement])

    if (!selectedElement || !values) return null

    const handleChange = (field: string, value: string) => {
        const newValues = { ...values, [field]: value };
        if (field in values.styles) {
            newValues.styles = { ...values.styles, [field]: value }
        };
        setValues(newValues);
        onUpdate({ [field]: value });
    }

    const handleStytleChange = (styleName: string, value: string) => {
        const newStyles = { ...values.styles, [styleName]: value };
        setValues({ ...values, styles: newStyles });
        onUpdate({ styles: {[styleName]: value} });
    }

    return (
        <div className='absolute top-4 right-4 w-80 bg-[#111216]/95 backdrop-blur-md rounded-2xl shadow-2xl border border-[#22242c] p-4.5 z-50 animate-kinetic-fade text-gray-100 font-sans'>
            {/* Header */}
            <div className='flex justify-between items-center pb-3 mb-3 border-b border-[#1c1e26]'>
                <div className='flex items-center gap-2'>
                    <SlidersIcon className='w-4 h-4 text-indigo-400' />
                    <h3 className='font-semibold text-xs text-gray-200 tracking-wide uppercase font-mono-tech'>
                        Inspector
                    </h3>
                    <span className='px-1.5 py-0.5 rounded bg-indigo-950/80 border border-indigo-500/30 text-[10px] font-mono-tech text-indigo-300'>
                        &lt;{values.tagName.toLowerCase()}&gt;
                    </span>
                </div>
                <button onClick={onClose} className='p-1 hover:bg-[#1c1e26] rounded-lg text-gray-400 hover:text-white transition-colors'>
                    <XIcon className='w-4 h-4' />
                </button>
            </div>

            {/* Controls */}
            <div className='space-y-3.5 text-xs'>
                <div>
                    <label className="block font-mono-tech text-[11px] text-gray-400 mb-1.5">
                        Text Content
                    </label>
                    <textarea 
                        value={values.text} 
                        onChange={(e) => handleChange('text', e.target.value)} 
                        className='w-full text-xs p-2.5 bg-[#08080a] border border-[#22242c] rounded-xl focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/50 outline-none text-gray-200 min-h-20 font-sans leading-relaxed' 
                    />
                </div>

                <div>
                    <label className="block font-mono-tech text-[11px] text-gray-400 mb-1.5">
                        Tailwind Classes
                    </label>
                    <input 
                        type='text' 
                        value={values.className || ''} 
                        onChange={(e) => handleChange('className', e.target.value)} 
                        className='w-full text-xs p-2 bg-[#08080a] border border-[#22242c] rounded-xl focus:border-indigo-500/80 outline-none font-mono-tech text-cyan-300' 
                    />
                </div>

                <div className='grid grid-cols-2 gap-2.5'>
                    <div>
                        <label className="block font-mono-tech text-[10px] text-gray-400 mb-1">Padding</label>
                        <input 
                            type='text' 
                            value={values.styles.padding} 
                            onChange={(e) => handleStytleChange('padding', e.target.value)} 
                            className='w-full text-xs p-2 bg-[#08080a] border border-[#22242c] rounded-lg focus:border-indigo-500/80 outline-none font-mono-tech text-gray-300' 
                        />
                    </div>
                    <div>
                        <label className="block font-mono-tech text-[10px] text-gray-400 mb-1">Margin</label>
                        <input 
                            type='text' 
                            value={values.styles.margin} 
                            onChange={(e) => handleStytleChange('margin', e.target.value)} 
                            className='w-full text-xs p-2 bg-[#08080a] border border-[#22242c] rounded-lg focus:border-indigo-500/80 outline-none font-mono-tech text-gray-300' 
                        />
                    </div>
                </div>

                <div className='grid grid-cols-2 gap-2.5'>
                    <div>
                        <label className="block font-mono-tech text-[10px] text-gray-400 mb-1">Font Size</label>
                        <input 
                            type='text' 
                            value={values.styles.fontSize} 
                            onChange={(e) => handleStytleChange('fontSize', e.target.value)} 
                            className='w-full text-xs p-2 bg-[#08080a] border border-[#22242c] rounded-lg focus:border-indigo-500/80 outline-none font-mono-tech text-gray-300' 
                        />
                    </div>
                </div>

                <div className='grid grid-cols-2 gap-2.5 pt-1'>
                    <div>
                        <label className="block font-mono-tech text-[10px] text-gray-400 mb-1">Background</label>
                        <div className='flex items-center gap-2 bg-[#08080a] border border-[#22242c] rounded-lg p-1.5'>
                            <input 
                                type='color' 
                                value={values.styles.backgroundColor === 'rgba(0,0,0,0)' ? '#ffffff' : values.styles.backgroundColor} 
                                onChange={(e) => handleStytleChange('backgroundColor', e.target.value)} 
                                className='w-6 h-6 rounded cursor-pointer border-none bg-transparent' 
                            />
                            <span className='text-[10px] font-mono-tech text-gray-400 truncate'>{values.styles.backgroundColor}</span>
                        </div>
                    </div>

                    <div>
                        <label className="block font-mono-tech text-[10px] text-gray-400 mb-1">Text Color</label>
                        <div className='flex items-center gap-2 bg-[#08080a] border border-[#22242c] rounded-lg p-1.5'>
                            <input 
                                type='color' 
                                value={values.styles.color} 
                                onChange={(e) => handleStytleChange('color', e.target.value)} 
                                className='w-6 h-6 rounded cursor-pointer border-none bg-transparent' 
                            />
                            <span className='text-[10px] font-mono-tech text-gray-400 truncate'>{values.styles.color}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default EditorPanel