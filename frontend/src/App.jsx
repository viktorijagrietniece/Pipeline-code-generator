import React, { useRef, useState, useEffect } from 'react';
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';
import ToolboxItem from './components/ToolboxItem';
import PipelineBox from './components/boxes/PipelineBox';
import StageBox from './components/boxes/StageBox'; 
import StagesBox from './components/boxes/StagesBox'; 
import PostBox from './components/boxes/PostBox';
import StepBox from './components/boxes/StepBox';
import { renderJenkinsfile } from './utils/renderJenkinsfile';
import GitlabPipelineBox from './components/boxes/GitLabBoxes/GitlabPipelineBox';
import GitlabJobBox from './components/boxes/GitLabBoxes/GitlabJobBox';
import GitlabScriptBox from './components/boxes/GitLabBoxes/GitlabScriptBox';
import GitlabStagesBox from './components/boxes/GitLabBoxes/GitlabStagesBox';
import GitlabBeforeAfterBox from './components/boxes/GitLabBoxes/GitlabBeforeAfterBox';
import { renderGitlabFile } from './utils/renderGitlabFile';
import { parseJenkinsfileToBlocks } from './utils/parseJenkinsfileToBlocks';
import downloadIcon from './assets/download-minimalistic-svgrepo-com.svg';
import uploadIcon from './assets/upload-minimalistic-svgrepo-com.svg';
import GitLabIcon from './assets/gitlab-svgrepo-com.svg';
import GitHubIcon from './assets/github-svgrepo-com.svg';
import closeIcon from './assets/close-ellipse-svgrepo-com.svg';






let idCounter = 1;


const boxTypes = {
  pipeline: PipelineBox,
  stage: StageBox,
  stages: StagesBox,
  post: PostBox,
  step: StepBox,

  gitlabPipeline : GitlabPipelineBox,
  job: GitlabJobBox,
  script: GitlabScriptBox,
  gitlabstages: GitlabStagesBox,
  beforeAfter: GitlabBeforeAfterBox
};


function DraggableBox({ id, position }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id });

  const panRef = useRef({ dragging: false,startX: 0, startY: 0 });


  const x = transform ? position.x + transform.x : position.x;
  const y = transform ? position.y + transform.y : position.y;

  const style = {transform: `translate(${x}px, ${y}px)`, background: '#88c',color: '#fff', padding: '1rem 2rem', borderRadius: '8px', cursor: 'grab', position: 'absolute',userSelect: 'none', zIndex: isDragging ? 1000 : 'auto'};

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      {id}
    </div>
  );
}




function DropBox({ children, dropRef, zoom, offset }) {

  const { setNodeRef } = useDroppable({ id: 'dropbox' });

  const style = {width: '900px',height: '580px',top: '0px',left: '245px', border: '3px #0a0a0a solid', borderRadius: '12px', margin: '100px auto', position: 'absolute', backgroundColor: '#f8f8f8', overflow: 'hidden'};

  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        dropRef.current = node;
      }}
      style={style}
  >
      <div
        style={{transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`, transformOrigin: '0 0',position: 'relative',width: '100%', height: '100%'}}>
        {children}
      </div>
    </div>
  );
}




export default function App() {
  const dropRef = useRef(null);
  const positionsRef = useRef({});
  const [activeConnector, setActiveConnector]= useState(null); 
  const [zoom, setZoom] = useState(1);
const [offset, setOffset] = useState({ x: 0,y: 0 });
const panRef = useRef({ dragging: false, startX: 0, startY: 0 });
const [latestJson, setLatestJson] = useState({});
const [jenkinsfile, setJenkinsfile] = useState('');
const [mode, setMode] = useState('jenkins');
const [jenkinsBoxes, setJenkinsBoxes] = useState([]);
const [gitlabBoxes, setGitlabBoxes] = useState([]);
const [jenkinsConnections, setJenkinsConnections] = useState([]);
const [gitlabConnections, setGitlabConnections] = useState([]);
const boxes = mode === 'jenkins' ? jenkinsBoxes : gitlabBoxes;
const setBoxes = mode === 'jenkins' ? setJenkinsBoxes : setGitlabBoxes;
const connections = mode === 'jenkins' ? jenkinsConnections : gitlabConnections;
const setConnections = mode === 'jenkins' ? setJenkinsConnections : setGitlabConnections;
const [showGitlabExportModal, setShowGitlabExportModal] = useState(false);
const [gitlabToken, setGitlabToken] = useState('');
const [gitlabProjectId, setGitlabProjectId] = useState('');
const [gitlabBranch, setGitlabBranch]= useState('main');
const [exportStatus, setExportStatus] = useState('');
const [showGithubExportModal, setShowGithubExportModal] = useState(false);
const [githubToken, setGithubToken] = useState('');
const [githubRepo, setGithubRepo] = useState('');
const [githubBranch, setGithubBranch] = useState('main');

async function handleExportToGithub() {
  try {
    setExportStatus('Sending to GitHub');

    const res = await fetch('http://localhost:3001/export-github', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({repo: githubRepo, branch: githubBranch, token: githubToken,fileContent: jenkinsfile})});

    const result=await res.json();

    if (res.ok &&(result.status === 'created' || result.status === 'updated')) {
      setExportStatus(`Jenkinsfile ${result.status} on GitHub!`);

    } else {

      setExportStatus(`Failed: ${JSON.stringify(result.error)}`);
    }
  } catch (err) {

    setExportStatus(`Error: ${err.message}`);
  }
}

async function handleExportToGitlab() {
  try {
    setExportStatus('Sending to GitLab...');

    const response = await fetch('http://localhost:3001/export-gitlab', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({projectId: gitlabProjectId, branch: gitlabBranch || 'main', token: gitlabToken,fileContent: jenkinsfile})});

    const result = await response.json();

    if (response.ok && (result.status === 'created' || result.status === 'updated')) {
      setExportStatus(`File ${result.status} on GitLab!`);

    } else {

      setExportStatus(`Failed: ${JSON.stringify(result.error) || 'Unknown error'}`);
    }
  } catch (err) {

    setExportStatus(`Error: ${err.message}`);
  }
}



useEffect(()=> {

  const disableBrowserZoom = (e)=> {
    if (e.ctrlKey) {
      e.preventDefault();
    }
  };

  window.addEventListener('wheel', disableBrowserZoom, { passive: false });
  return ()=> {
    window.removeEventListener('wheel', disableBrowserZoom);
  };
}, []);

useEffect(() => {

  if (mode === 'jenkins') {
  const json = generatePipelineJson();
   setLatestJson(json);


    if (!json || Object.keys(json).length === 0) {
      setJenkinsfile('');
      return;
    }

    try {

      const rendered = renderJenkinsfile(json);
      setJenkinsfile(rendered);

    } catch (err) {

      setJenkinsfile('// Error rendering Jenkinsfile');
    }
  }


  if (mode === 'gitlab') {
    const json = generateGitlabPipelineJson();
    setLatestJson(json);

    if (!json || Object.keys(json).length === 0) {
      setJenkinsfile('');
      return;
    }

    try {

      const rendered = renderGitlabFile(json);
      setJenkinsfile(rendered);

    } catch (err) {

      setJenkinsfile('# Error rendering GitLab CI YAML');
    }
  }
}, [boxes,connections,mode]);




  
const isDotConnected = (dotId)=> {
  return connections.some(conn=> conn.from === dotId || conn.to === dotId);
};

const getDotCenter = (id)=> {

const el = document.getElementById(id);
 const drop = dropRef.current;
 if (!el || !drop) return null;

  const rect = el.getBoundingClientRect();
  const dropRect = drop.getBoundingClientRect();

  const x = (rect.left + rect.width / 2 - dropRect.left - offset.x) / zoom;
  const y = (rect.top + rect.height / 2 - dropRect.top - offset.y) / zoom;


  return {x,y};
};


  
  const handleDotClick = (id) => {

    if (!activeConnector) {
      setActiveConnector(id);

    } else {

      setConnections((prev) => [...prev, { from: activeConnector, to: id }]);
      setActiveConnector(null);
    }
  };

  const gitlabToolboxItems = [
    { type: 'gitlabPipeline', label: 'Pipeline' },
    { type: 'gitlabstages', label: 'Stages' },
    { type: 'job', label: 'Job' },
    { type: 'script', label: 'Script' },
    { type: 'beforeAfter', label: 'Before/After' },
  ];
  
  

  const toolboxItems = [
    { type: 'pipeline', label: 'Pipeline' },
    { type: 'stages', label: 'Stages' },
    { type: 'stage', label: 'Stage' },
    { type: 'step', label: 'Steps' },
    { type: 'post', label: 'Post' },
  ];

  const handleDragMove = ({ active,delta })=> {
    if (active.id.startsWith('box-')) {
      positionsRef.current[active.id] = {
        x: boxes.find(b => b.id === active.id).position.x + delta.x,
        y: boxes.find(b => b.id === active.id).position.y + delta.y,
      };
    }
  };

  const handleDragEnd = ({ active, over })=> {
    if (active.id.startsWith('box-')) {
      const newPos = positionsRef.current[active.id];
      if (newPos) {
        setBoxes((prev)=>
          prev.map((box)=>
            box.id === active.id ? { ...box, position: newPos } : box
          )
        );
        delete positionsRef.current[active.id];
      }
    }
    

    if (active.data?.current?.fromToolbox && over?.id === 'dropbox') {
      const type = active.data.current.type;
      const dropRect = dropRef.current.getBoundingClientRect();
      const relativeX = active.rect.current.translated.left - dropRect.left;
      const relativeY = active.rect.current.translated.top - dropRect.top;

      setBoxes((prev)=> [
        ...prev,
        {
          id: `box-${idCounter++}`,
          type,
          position: { x: relativeX, y: relativeY },
          label: type.charAt(0).toUpperCase() + type.slice(1),
        },
      ]);
      
    }

    else if (active.id.startsWith('box-')) {
      const newPos = positionsRef.current[active.id];
      if (newPos) {
        setBoxes((prev)=>
          prev.map((box)=>
            box.id === active.id ? { ...box, position: newPos } : box
          )
        );
        delete positionsRef.current[active.id];
      }
    }
  };
  
  function generatePipelineJson() {

    const getBoxIdFromDotId = (dotId)=> {
      const match = dotId.match(/box-\d+/);
      return match ? match[0] : null;
    };
  
    const pipelineBox = boxes.find(box => box.type === 'pipeline');
    if (!pipelineBox) return {};

    const postBox = boxes.find(box => box.type === 'post');
  
    const isPostConnectedToPipeline = connections.some(conn => {

      return (
        (conn.from === `pipeline-box-${pipelineBox.id}-post-in` && conn.to === `pipeline-box-${postBox?.id}-pipeline-in`) ||
        (conn.to === `pipeline-box-${pipelineBox.id}-post-in` && conn.from === `pipeline-box-${postBox?.id}-pipeline-in`)
        
      );
    });

    
const postSteps = { ...(pipelineBox?.post || {}) };

if (postBox && isPostConnectedToPipeline) {
  postBox.conditions?.forEach((condition, index)=> {
    const conditionDot = `post-box-${postBox.id}-condition-${index}`;
    const stepConn = connections.find(conn =>
      conn.from === conditionDot || conn.to === conditionDot
    );

    const stepBoxId = stepConn
      ? getBoxIdFromDotId(stepConn.from === conditionDot ? stepConn.to : stepConn.from)
      : null;

    const stepBox = boxes.find(box => box.id === stepBoxId && box.type === 'step');

    if (stepBox?.steps?.length) {
      postSteps[condition] = stepBox.steps;
    }
  });
}

    
    
    const getAgent = (box)=> {
      if (!box.agentType || box.agentType.trim() === '') {
         return undefined;
      }
      if (box.agentType === 'label') {
        return { label: box.agentDetail };
      }
      if (box.agentType === 'docker') {
        return { docker: { image: box.agentDetail } };
      }
      if (box.agentType === 'dockerfile') {
        return { dockerfile: { filename: box.agentDetail } };
      }
      return box.agentType || 'any';
    };
    
  
    const getEnv = (box)=> {
  return (box.environment || []).filter(({ key, value }) => key?.trim() && value?.trim());


};


    const stagesConnection = connections.find(conn => {
      const fromId = getBoxIdFromDotId(conn.from);
      const toId = getBoxIdFromDotId(conn.to);
      const toBox = boxes.find(b => b.id === toId);
      return fromId === pipelineBox.id && toBox?.type === 'stages';
    });
  
    const stagesBox = stagesConnection
      ? boxes.find(b => b.id === getBoxIdFromDotId(stagesConnection.to) && b.type === 'stages')
      : null;

    const stageConnections = stagesBox
      ? connections.filter(conn => {

          const fromId = getBoxIdFromDotId(conn.from);
          const toId = getBoxIdFromDotId(conn.to);
          const toBox = boxes.find(b => b.id === toId);
          return fromId === stagesBox.id && toBox?.type === 'stage';
        })
      : [];
  
    const stageBoxes = stageConnections
    .map(conn => boxes.find(b => b.id === getBoxIdFromDotId(conn.to)))
      .filter(Boolean);
  

stageBoxes.forEach(stage => {
  const connectedStep = boxes.find(b => {
    if (b.type !== 'step') return false;
  
    return connections.some(conn => {
      return (
        (conn.from === `stage-box-${stage.id}-out` && conn.to === `step-box-${b.id}-target`) ||
        (conn.to === `stage-box-${stage.id}-out` && conn.from === `step-box-${b.id}-target`)
      );
    });
  });
  
});


    const pipeline = {
      
      type: 'pipeline',
      id: pipelineBox.id,
      agent: getAgent(pipelineBox),
      environment: getEnv(pipelineBox),
      post: postSteps,
      stages: stageBoxes.map(stage => {

        const connectedStep = boxes.find(b=> {
          if (b.type !== 'step') return false;
  
          return connections.some(conn => {
            const from = getBoxIdFromDotId(conn.from);
            const to = getBoxIdFromDotId(conn.to);
            return (
              (from === stage.id && to === b.id) ||
              (to === stage.id && from === b.id)
            );
          });
        });
  


const stagePostConnection = connections.find(conn=>
  conn.from === `stage-box-${stage.id}-post-in` && conn.to.startsWith('pipeline-box-') && conn.to.includes('-pipeline-in')
);

const connectedPostBoxId = stagePostConnection
  ? stagePostConnection.to.match(/box-\d+/)?.[0]
  : null;


const stagePostBox = boxes.find(b=> b.id === connectedPostBoxId && b.type === 'post');

const stagePostSteps = {};

if (stagePostBox?.conditions?.length) {
  stagePostBox.conditions.forEach((condition, index) => {
    const conditionDot = `post-box-${stagePostBox.id}-condition-${index}`;
    const stepConn = connections.find(conn=>
      conn.from === conditionDot || conn.to === conditionDot
    );

    const stepBoxId = stepConn
      ? getBoxIdFromDotId(stepConn.from === conditionDot ? stepConn.to : stepConn.from)
      : null;

    const stepBox = boxes.find(box=> box.id === stepBoxId && box.type === 'step');

    if (stepBox?.steps?.length) {
      stagePostSteps[condition] = stepBox.steps;
    }
  });
}



return {
  type: 'stage',
  name: stage.label || 'Unnamed Stage',
  agent: getAgent(stage),
  environment: getEnv(stage),
  steps: connectedStep?.steps || [],
  ...(Object.keys(stagePostSteps).length > 0 && { post: stagePostSteps }),
};

      }),
    };
  
    return pipeline;

  }
  function generateGitlabPipelineJson() {

    const getBoxIdFromDotId = (dotId) => {
      const match = dotId.match(/box-\d+/);
      return match ? match[0] : null;

    };
  
    const jobs = [];
    const declaredStages = new Set();
    const inferredStages = new Set();
    const globalScripts = {
      before_script: [],
      after_script: [],
    };
  
    let globalImage = null;
    let stagesBoxExists = false;
    const pipelineBox = gitlabBoxes.find(b => b.type === 'gitlabPipeline');
const beforeAfterBox = gitlabBoxes.find(b => b.type === 'beforeAfter');

const isBeforeAfterConnectedToPipeline = beforeAfterBox && gitlabConnections.some(conn=> {
  return (
    (conn.from.includes(beforeAfterBox.id) && conn.to.includes(pipelineBox?.id)) ||
    (conn.to.includes(beforeAfterBox.id) && conn.from.includes(pipelineBox?.id))
  );
});

  
    gitlabBoxes.forEach((box)=> {
     
      if (box.type === 'gitlabstages') {
        stagesBoxExists = true;
        box.gStages?.forEach((s) => {
          if (s.label) declaredStages.add(s.label);
        });
      }
  
      
      if (box.type === 'gitlabPipeline' && box.image) {
        globalImage = box.image;
      }
  
      
      if (box.type === 'job') {
        const isConnectedToPipelineOrStages = gitlabConnections.some(conn => {
          const fromId = getBoxIdFromDotId(conn.from);
          const toId = getBoxIdFromDotId(conn.to);
      
          const fromType = gitlabBoxes.find(b => b.id === fromId)?.type;
          const toType = gitlabBoxes.find(b => b.id === toId)?.type;
      
          return (
            (conn.from.includes(box.id) || conn.to.includes(box.id)) &&
            (fromType === 'gitlabPipeline' || toType === 'gitlabPipeline' ||
             fromType === 'gitlabstages' || toType === 'gitlabstages')
          );
        });
      
        if (!isConnectedToPipelineOrStages) return;
      
      
        const job = {
          name: box.jobName?.trim() ? box.jobName : 'job', 
          script: [],
        };
      
        if (box.stage?.trim()) {
          job.stage = box.stage;
        }
      
        if (box.image?.trim()) {
          job.image = box.image;
        }
      
        jobs.push(job);

        gitlabBoxes.forEach((b)=> {
  if (b.type === 'beforeAfter' && b.scripts) {
    const isBeforeConnected = gitlabConnections.some(conn =>
      conn.from === `before-after-box-${b.id}-bottom` && conn.to === `job-box-${box.id}-top`
    );
    const isAfterConnected = gitlabConnections.some(conn =>
      conn.from === `job-box-${box.id}-bottom` && conn.to === `before-after-box-${b.id}-top`
    );

    if (isBeforeConnected && b.scripts.before_script?.length) {
      job.before_script = [...b.scripts.before_script];
    }

    if (isAfterConnected && b.scripts.after_script?.length) {
      job.after_script = [...b.scripts.after_script];
    }
  }
});
      }
      
      
  
      
      if (box.type === 'script') {
        const connectedJob = gitlabConnections.find((conn)=>
          conn.from.includes(box.id) || conn.to.includes(box.id)
        );
        const jobBoxId = connectedJob
          ? getBoxIdFromDotId(
              connectedJob.from.includes(box.id) ? connectedJob.to : connectedJob.from
            )
          : null;
  
        const jobBox = gitlabBoxes.find((b)=> b.id === jobBoxId && b.type === 'job');
  
        if (jobBox) {
          const job = jobs.find((j)=> j.name === jobBox.jobName);
          if (job && box.scripts?.script?.length) {
            job.script = [...box.scripts.script];
          }
        }
      }
  
      
      if (box.type === 'beforeAfter') {
  const isConnectedToPipeline = gitlabConnections.some(conn => {
    const fromId = getBoxIdFromDotId(conn.from);
    const toId = getBoxIdFromDotId(conn.to);
    return (
      (fromId === box.id && toId === pipelineBox?.id) ||
      (toId === box.id && fromId === pipelineBox?.id)
    );
  });

  if (isConnectedToPipeline) {
    if (box.scripts?.before_script?.length) {
      globalScripts.before_script.push(...box.scripts.before_script);
    }
    if (box.scripts?.after_script?.length) {
      globalScripts.after_script.push(...box.scripts.after_script);
    }
  }
}


    });
  
    const finalStages = stagesBoxExists
      ? Array.from(declaredStages)
      : []; 
  
    return {
      ...(globalImage && { image: globalImage }),
      ...(finalStages.length > 0 && { stages: finalStages }),
      jobs,
      ...globalScripts,
    };
  }
  
  
  
  return (
    <div style={{ position: 'relative', height: '100vh' }}>
      <DndContext onDragMove={handleDragMove} onDragEnd={handleDragEnd}>
        
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '200px', background: '#bcd' }}>
  <div style={{ padding: '20px' }}>
    {(mode === 'jenkins' ? toolboxItems : gitlabToolboxItems).map((item) => (
      <ToolboxItem key={item.type} {...item} />
    ))}
    <button
  onClick={() => setShowGitlabExportModal(true)}
  style={{position: 'absolute',top: '400px', right: '20px',left: '8px', padding: '10px 16px', backgroundColor: '#6b7280', border: 'none', borderRadius: '6px', color: '#fff',fontWeight: 'bold',fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 8px rgba(0,0,0,0.1)'}}>
  <img src={GitLabIcon} alt="GitLab" style={{ width: '18px', height: '18px', verticalAlign: 'middle', transform: 'translate(-4px, -1px)' }} />
   Export to GitLab
</button>
{mode === 'jenkins' && (
  <button
    onClick={() => setShowGithubExportModal(true)}
    style={{position: 'absolute', top: '550px', right: '20px', left: '8px', padding: '10px 16px', backgroundColor: '#24292f', border: 'none', borderRadius: '6px', color: '#fff', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 8px rgba(0,0,0,0.1)'}}>
    <img src={GitHubIcon} alt="GitHub" style={{ width: '18px', height: '18px', verticalAlign: 'middle', transform: 'translate(-4px, -1px)' }} />
     Export to GitHub
  </button>
)}
 
    {mode === 'jenkins' && (
  <button
    onClick={() => {

      const content = jenkinsfile;
      const blob = new Blob([content], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Jenkinsfile';
      a.click();
      URL.revokeObjectURL(url);

    }}
    style={{ position: 'absolute', top: '450px', right: '20px', padding: '10px 16px', backgroundColor: '#10b981', border: 'none', borderRadius: '6px', color: '#fff',fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', transition: 'background-color 0.3s ease' }}
     onMouseOver={(e) => (e.target.style.backgroundColor = '#059669')}
    onMouseOut={(e) => (e.target.style.backgroundColor = '#10b981')}
  >
    <img src={downloadIcon} alt="downloadIcon" style={{ width: '20px', height: '20px', verticalAlign: 'middle', transform: 'translate(-4px, -1px)' }} />
    Export Jenkinsfile
  </button>
)}





{mode === 'gitlab' && (
  <button
    onClick={() => {

      const content = jenkinsfile;
      const blob = new Blob([content], { type: 'application/x-yaml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = '.gitlab-ci.yml';
      a.click();
      URL.revokeObjectURL(url);

    }}
    style={{position: 'absolute', top: '450px', right: '20px', left: '8px', padding: '10px 16px', backgroundColor: '#2563eb', border: 'none', borderRadius: '6px', color: '#fff', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', transition: 'background-color 0.3s ease'}}
        onMouseOver={(e) => (e.target.style.backgroundColor = '#1d4ed8')}
    onMouseOut={(e) => (e.target.style.backgroundColor = '#2563eb')}
  >
    <img src={downloadIcon} alt="downloadIcon" style={{ width: '20px', height: '20px', verticalAlign: 'middle', transform: 'translate(-4px, -1px)' }} />
    Export .gitlab-ci.yml
  </button>
  
  
)}
{mode === 'gitlab' && (
  <button
    onClick={() => document.getElementById('gitlab-upload').click()}
    style={{position: 'absolute',top: '520px', right: '20px', left: '8px', padding: '10px 16px',display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#f97316', border: 'none', borderRadius: '6px',color: '#fff',fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
      <img src={uploadIcon} alt="uploadIcon" style={{ width: '18px', height: '18px', verticalAlign: 'middle', transform: 'translate(-4px, -1px)' }} />
      Upload .gitlab-ci.yml
  </button>
)}

<input
  id="gitlab-upload"
  type="file"
  accept=".yml,.yaml"
  style={{ display: 'none' }}
  onChange={async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const { parseGitlabFileToBlocks } = await import('./utils/parseGitLabFileToBlocks');
    const { boxes: newBoxes, connections: newConnections } = parseGitlabFileToBlocks(text);
    setBoxes(newBoxes);
    setConnections(newConnections);
  }}
/>

{showGithubExportModal && (
  <div style={{
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000,
  }}>
    <div style={{
      background: '#e0f0ff', padding: '20px', borderRadius: '8px', width: '400px',
      display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative',
    }}>
      <h3>Export Jenkinsfile to GitHub</h3>

      <label>GitHub Token</label>
      <input
        type="password"
        value={githubToken}
        onChange={(e) => setGithubToken(e.target.value)}
        placeholder="Paste your GitHub token"
        style={{ padding: '8px', background:'#f2f8fc', borderRadius: '6px' }}
      />

      <label>Repository (e.g. user/repo)</label>
      <input
        type="text"
        value={githubRepo}
        onChange={(e) => setGithubRepo(e.target.value)}
        placeholder="username/repo-name"
        style={{ padding: '8px', background:'#f2f8fc', borderRadius: '6px' }}
      />

      <label>Branch (e.g. main)</label>
      <input
        type="text"
        value={githubBranch}
        onChange={(e) => setGithubBranch(e.target.value)}
        placeholder="main"
        style={{ padding: '8px', background:'#f2f8fc', borderRadius: '6px' }}
      />

      <button
        onClick={handleExportToGithub}
        style={{ backgroundColor: '#7f90a1', color: 'white', padding: '10px', fontWeight: 'bold', borderRadius: '6px', cursor: 'pointer'}}>
        Push to GitHub
      </button>

      {exportStatus && <p>{exportStatus}</p>}
      
      <img
  src={closeIcon}
  alt="Close"
  onClick={() => setShowGitlabExportModal(false)}
  style={{position: 'absolute', top: '2px', right: '2px', width: '40px', height: '40px',cursor: 'pointer'}}
/>
    </div>
  </div>
)}
{mode === 'jenkins' && (
  <button
    onClick={() => document.getElementById('jenkinsfile-upload').click()}
    style={{position: 'absolute', top: '500px', right: '20px', padding: '10px 16px',backgroundColor: '#f59e0b', border: 'none', borderRadius: '6px', color: '#fff', fontWeight: 'bold',fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 8px rgba(0,0,0,0.1)'}}
  >
    <img src={uploadIcon} alt="uploadIcon" style={{ width: '18px', height: '18px', verticalAlign: 'middle', transform: 'translate(-4px, -1px)' }} />
    Upload Jenkinsfile
  </button>
)}
<input
  id="jenkinsfile-upload"
  type="file"
  accept=""

  style={{ display: 'none' }}
  onChange={async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const { boxes: newBoxes, connections: newConnections } = parseJenkinsfileToBlocks(text);
    setBoxes(newBoxes);
    setConnections(newConnections);
  }}
/>
  </div>
</div>

        {}
        <div
  onWheel={(e) => {
    if (e.ctrlKey) {
      e.preventDefault(); 
    }
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom((prev) => Math.min(Math.max(prev + delta, 0.3), 2));
  }}
  
  onMouseDown={(e) => {
    if (e.button === 1 || e.shiftKey) {
      panRef.current.dragging = true;
      panRef.current.startX = e.clientX - offset.x;
      panRef.current.startY = e.clientY - offset.y;
    }
  }}
  onMouseMove={(e) => {
    if (panRef.current.dragging) {
      setOffset({
        x: e.clientX - panRef.current.startX,
        y: e.clientY - panRef.current.startY,
      });
    }
  }}
  onMouseUp={() => (panRef.current.dragging = false)}
  style={{ width: '100%', height: '100%', overflow: 'hidden', cursor: 'grab' }}
>
  <DropBox dropRef={dropRef} zoom={zoom} offset={offset}>
    {boxes.map((box) => {
      const BoxComponent = boxTypes[box.type] || (() => null);
      return (
        <BoxComponent
          key={box.id}
          id={box.id}
          position={box.position}
          label={box.label}
          image={box.image} 
          scripts={box.scripts} 
          gStages={box.gStages} 
          jobName={box.jobName}
          stage={box.stage}
          jobImage={box.image}
          onDotClick={handleDotClick}
          agentType={box.agentType}
          agentDetail={box.agentDetail}        
          activeConnector={activeConnector}
          isDotConnected={isDotConnected}
          conditions={box.conditions}
          onLabelChange={(newLabel) => {
            setBoxes((prev) =>
              prev.map((b) =>
                b.id === box.id ? { ...b, label: newLabel } : b
              )
            );
          }}
          onDelete={(idToDelete) => {
            setBoxes((prev) => prev.filter((b) => b.id !== idToDelete));
          }}
          onUpdate={(id, updatedData) => {
            setBoxes((prev) =>
              prev.map((b) =>
                b.id === id ? { ...b, ...updatedData } : b
            
              ) 
            ); 
          }}
          {...(box.stages && { stages: box.stages })}
          {...(box.steps && { steps: box.steps })}
          {...(box.environment && { environment: box.environment })}

        />
      );
    })}

    <svg
  style={{position: 'absolute', top: 0,left: 0,width: '2000px', height: '2000px', overflow: 'visible', pointerEvents: 'none'}}>

      {connections.map((conn, i) => {
        const from = getDotCenter(conn.from);
        const to = getDotCenter(conn.to);
        if (!from || !to) return null;
        const midY = (from.y + to.y) / 2;

        return (
          <polyline
            key={i}
            points={`${from.x},${from.y} ${from.x},${midY} ${to.x},${midY} ${to.x},${to.y}`}
            fill="none"
            stroke="red"
            strokeWidth="2"
          />
        );
      })}
    </svg>
   






  </DropBox>
</div>
{(mode === 'jenkins' || mode === 'gitlab') && (
  <pre
    style={{position: 'absolute', right: 0, top: 0, width: '20%',height: '100%',overflow: 'auto', backgroundColor: '#1e1e1e',color: '#dcdcdc', padding: '1rem', fontFamily: 'monospace', whiteSpace: 'pre-wrap', lineHeight: '1', zIndex: 10}}>
    {jenkinsfile || (mode === 'jenkins' ? '// Jenkinsfile will appear here...' : '# .gitlab-ci.yml will appear here...')}
  </pre>
)}



  
<button
  onClick={() =>
    setConnections((prev) => [
      ...prev,
      {
        from: 'post-box-1-condition-0',
        to: 'step-box-3-target',
      },
    ])
  }
>
  Connect post-box-1-condition-0 → step-box-3
</button>

      </DndContext>
      <div style={{ position: 'absolute', top: 20, left: 220, zIndex: 20 }}>
  <button
    onClick={() => setMode('jenkins')}
    style={{marginRight: '10px', padding: '6px 12px', backgroundColor: mode === 'jenkins' ? '#10b981' : '#ccc', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', }}>
    Jenkinsfile
  </button>
  <button
    onClick={() => setMode('gitlab')}
    style={{padding: '6px 12px', backgroundColor: mode === 'gitlab' ? '#2563eb' : '#ccc', color: 'white',border: 'none', borderRadius: '4px', cursor: 'pointer'}}>
    .gitlab-ci.yml
  </button>
</div>
{showGitlabExportModal && (
  <div style={{
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', 
    zIndex: 1000,
  }}>
    <div style={{
      background: '#e0f0ff', padding: '20px', borderRadius: '8px', width: '400px',
      display: 'flex', flexDirection: 'column', gap: '12px',position: 'relative'
    }}>
      <h3>Export to GitLab</h3>

      <label>Personal Access Token</label>
      <input
        type="password"
        value={gitlabToken}
        onChange={(e) => setGitlabToken(e.target.value)}
        placeholder="Paste your token here"
        style={{ padding: '8px', borderRadius: '6px', background:'#f2f8fc'}}
      />

      <label>Project ID</label>
      <input
        type="text"
        value={gitlabProjectId}
        onChange={(e) => setGitlabProjectId(e.target.value)}
        placeholder="e.g., 12345678"
        style={{ padding: '8px', borderRadius: '6px', background:'#f2f8fc'}}
      />

      <label>Branch (default: main)</label>
      <input
        type="text"
        value={gitlabBranch}
        onChange={(e) => setGitlabBranch(e.target.value)}
        placeholder="main"
        style={{ padding: '8px', borderRadius: '6px', background:'#f2f8fc'}}
      />

      <button
        onClick={handleExportToGitlab}
        style={{backgroundColor: '#7f90a1', color: 'white', padding: '10px', fontWeight: 'bold', borderRadius: '6px', cursor: 'pointer'}}>
        Push to GitLab
      </button>

      {exportStatus && <p>{exportStatus}</p>}

      <img
  src={closeIcon}
  alt="Close"
  onClick={() => setShowGitlabExportModal(false)}
  style={{position: 'absolute', top: '2px',right: '2px',width: '40px', height: '40px', cursor: 'pointer'}}/>
    </div>
  </div>
)}

    </div>
  );
}
