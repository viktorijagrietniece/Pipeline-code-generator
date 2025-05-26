import yaml from 'js-yaml';

let idCounter = 1;

const generateId = ()=> `box-${idCounter++}`;

export function parseGitlabFileToBlocks(ymlText) {

  idCounter = 1;
  const boxes = [];
  const connections = [];

  let parsed;
  
  try {
    parsed = yaml.load(ymlText);
  } catch (err) {
    console.error("errror2", err);
    return { boxes, connections };
  }


  // Pipeline boxam
const pipelineId = generateId();
boxes.push({id: pipelineId,type: 'gitlabPipeline', position: { x: 100, y: 100 }, image: parsed.image || ''});



// 2. B un a box

if (Array.isArray(parsed.before_script)) {
  const beforeId = generateId();
  boxes.push({id: beforeId, type: 'beforeAfter', position: { x: 100, y: 300 },scripts: { before_script: parsed.before_script }});


  connections.push({

    from: `before-after-box-${beforeId}-bottom`,
    to: `gitlab-pipeline-box-${pipelineId}-top`,

  });
}

if (Array.isArray(parsed.after_script)) {
  const afterId = generateId();
  boxes.push({id: afterId,type: 'beforeAfter', position: { x: 100, y: 450 },scripts: { after_script: parsed.after_script }});

  connections.push({

    from: `before-after-box-${afterId}-top`,
    to: `gitlab-pipeline-box-${pipelineId}-bottom`,

  });
}

// 3. Stages boxam
let stagesBoxId=null;

if (Array.isArray(parsed.stages)) {
  stagesBoxId = generateId();

  const stageLabels= parsed.stages.map(label=> ({ label }));

  boxes.push({id: stagesBoxId,type: 'gitlabstages', position: { x: 300, y: 100 }, gStages: stageLabels});

  connections.push({

    from: `gitlab-pipeline-box-${pipelineId}-out`,
    to: `gstage-box-${stagesBoxId}-in`,
  });
}

// 4. Job boxam
const knownTopLevelKeys = ['image','stages','before_script','after_script'];

Object.entries(parsed).forEach(([jobName, jobDef])=> {

  if (knownTopLevelKeys.includes(jobName)) return;
  if (typeof jobDef !== 'object') return;

  const jobId = generateId();

  boxes.push({id: jobId, type: 'job', position: { x: 300, y: 300 + boxes.length * 100 },jobName, stage: jobDef.stage || '', image: jobDef.image || ''});

  if (stagesBoxId) {

    const targetStage = jobDef.stage?.trim();
    const stageIndex = parsed.stages?.findIndex(s=> s === targetStage);
    if (stageIndex >= 0) {
      connections.push({

        from: `job-box-${jobId}-in`,
        to: `gstage-box-${stagesBoxId}-stage-${stageIndex}`,

      } );
    }
  }

if (Array.isArray(jobDef.before_script)) {
  const beforeId = generateId();

  boxes.push({
    id: beforeId,
    type: 'beforeAfter',
    position: { x: 100, y: 300 + boxes.length * 100 },
    scripts: { before_script: jobDef.before_script },
  });

  connections.push({

    from: `before-after-box-${beforeId}-bottom`,
    to: `job-box-${jobId}-top`,
  });
}


if (Array.isArray(jobDef.after_script)) {
  const afterId = generateId();



  boxes.push({id: afterId, type: 'beforeAfter', position: { x: 100, y: 350 + boxes.length * 100 }, scripts: { after_script: jobDef.after_script }});

  connections.push({

    from: `job-box-${jobId}-bottom`,
    to: `before-after-box-${afterId}-top`,

  });
}


if (Array.isArray(jobDef.script)) {
  const scriptId = generateId();

  boxes.push({id: scriptId, type: 'script', position: { x: 550, y: 300 + boxes.length * 100 },scripts: {script: jobDef.script}});

  connections.push({

    from: `script-box-${scriptId}-left`,
    to: `job-box-${jobId}-out`,
  });
}
});




  return { boxes, connections };
}
