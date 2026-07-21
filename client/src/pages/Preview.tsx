import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { dummyProjects } from "../assets/assets";
import ProjectPreview from "../components/ProjectPreview";
import type { Project } from "../types";
import { Loader2Icon } from "lucide-react";


const Preview = () => {

const { projectId, versionId } = useParams()
const [code, setCode] = useState('');
const [loading, setLoading] = useState(true);

const fetchCode = async () => {
  setTimeout(()=>{
    const code = dummyProjects.find(project=> project.id === projectId)?.
    current_code;
    if (code) {
      setCode(code);
      setLoading(false)
    }
  },2000)
  }

  useEffect(()=>{
    fetchCode()
  },[])

  if (loading) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <Loader2Icon className='animate-spin text-white size=7' />
      </div>
    )
  }
  return (
    <div className="h-screen">
      {code && <ProjectPreview project={{current_code: code} as Project } 
      isGenerating={false} showEditorPanel={false} />}
    </div>
  )
}

export default Preview