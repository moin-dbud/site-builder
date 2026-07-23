import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Loader2Icon } from 'lucide-react';
import ProjectPreview from '../components/ProjectPreview';
import type { Project } from '../types';
import api from '@/configs/axios';
import { toast } from 'sonner';

const View = () => {
  const { projectId, username, slug } = useParams();
  const [code, setCode] = useState('');
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCode = async () => {
    try {
      if (username && slug) {
        const cleanUsername = username.startsWith('@') ? username.slice(1) : username;
        const { data } = await api.get(`/api/project/published-by-slug/${cleanUsername}/${slug}`);
        setCode(data.code);
        if (data.project) {
          setProject(data.project);
        }
      } else if (projectId) {
        const { data } = await api.get(`/api/project/published/${projectId}`);
        setCode(data.code);
        if (data.project) {
          setProject(data.project);
        }
      }
      setLoading(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message);
      console.log(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCode();
  }, [projectId, username, slug]);

  useEffect(() => {
    if (project?.name) {
      document.title = `${project.name} - Synthesized with Buildo AI`;

      // Set meta description
      let metaDesc = document.querySelector("meta[name='description']");
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', project.initial_prompt || `View ${project.name} published on Buildo.`);

      // Set Open Graph Title
      let ogTitle = document.querySelector("meta[property='og:title']");
      if (!ogTitle) {
        ogTitle = document.createElement('meta');
        ogTitle.setAttribute('property', 'og:title');
        document.head.appendChild(ogTitle);
      }
      ogTitle.setAttribute('content', project.name);

      // Set Open Graph Description
      let ogDesc = document.querySelector("meta[property='og:description']");
      if (!ogDesc) {
        ogDesc = document.createElement('meta');
        ogDesc.setAttribute('property', 'og:description');
        document.head.appendChild(ogDesc);
      }
      ogDesc.setAttribute('content', project.initial_prompt || `View ${project.name} published on Buildo.`);
    }
  }, [project]);

  if (loading) {
    return (
      <div className='flex items-center justify-center h-screen bg-[#08080a] text-white'>
        <div className="flex flex-col items-center gap-3 font-mono-tech text-xs text-indigo-400">
          <Loader2Icon className='animate-spin text-cyan-400 size-8' />
          <span>LOADING_PUBLISHED_SITE...</span>
        </div>
      </div>
    );
  }

  return (
    <div className='h-screen w-full bg-[#08080a] p-2'>
      {code && <ProjectPreview project={{ current_code: code } as Project} 
      isGenerating={false} showEditorPanel={false} />}
    </div>
  );
};

export default View