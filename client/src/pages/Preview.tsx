import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ProjectPreview from "../components/ProjectPreview";
import type { Project, Version } from "../types";
import { Loader2Icon } from "lucide-react";
import api from "@/configs/axios";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

const Preview = () => {

  const {data: session, isPending} = authClient.useSession();

const { projectId, versionId } = useParams()
const [code, setCode] = useState('');
const [loading, setLoading] = useState(true);

const fetchCode = async () => {
  try {
    const {data} = await api.get(`/api/project/preview/${projectId}`)
    setCode(data.project.current_code)
    if(versionId){
      data.project.versions.forEach((version: Version)=>{
        if (version.id === versionId) {
          setCode(version.code)
        }
      })
    }
    setLoading(false);
  } catch (error: any) {
    console.log(error);
    toast.error(error.response?.data?.message || error.message)
  }
  }

  useEffect(()=>{
    if (!isPending && session?.user) {
      fetchCode()
    }
  },[session?.user, isPending])

  if (loading) {
    return (
      <div className='flex items-center justify-center h-screen bg-[#08080a] text-white'>
        <div className="flex flex-col items-center gap-3 font-mono-tech text-xs text-indigo-400">
          <Loader2Icon className='animate-spin text-indigo-500 size-8' />
          <span>LOADING_CANVAS_PREVIEW...</span>
        </div>
      </div>
    )
  }
  return (
    <div className="h-screen w-full bg-[#08080a] p-2">
      {code && <ProjectPreview project={{current_code: code} as Project } 
      isGenerating={false} showEditorPanel={false} />}
    </div>
  )
}

export default Preview