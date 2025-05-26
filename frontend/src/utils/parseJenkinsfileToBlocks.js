let idCounter = 1;

const generateId = ()=> `box-${idCounter++}`;

export function parseJenkinsfileToBlocks(jenkinsfileText) {
  idCounter = 1;
  const boxes = [];
  const connections = [];
  

  const pipelineId = generateId();
  boxes.push({id: pipelineId,type: 'pipeline', position: { x: 100, y: 100 }, agentType: 'any',agentDetail: '', environment: []});


const pipelineStart = jenkinsfileText.indexOf('pipeline {');
let pipelineBody = '';
let pipelineOnlyBody = '';
let pipelinePostBody = '';

if (pipelineStart !== -1) {

  let braceCount = 1;

  let i = pipelineStart + 'pipeline {'.length;
  while (i < jenkinsfileText.length && braceCount > 0) {
    if (jenkinsfileText[i] === '{') braceCount++;
    else if (jenkinsfileText[i] === '}') braceCount--;

    i++;
  }
  let fullPipelineBody = jenkinsfileText.slice(pipelineStart + 'pipeline {'.length, i - 1);
const stagesIndex = fullPipelineBody.indexOf('stages {');
pipelineOnlyBody = stagesIndex !== -1 ? fullPipelineBody.slice(0, stagesIndex) : fullPipelineBody;


  const postStart = pipelineOnlyBody.indexOf('post {');

if (postStart !== -1) {
  let braceCount = 1;
  let i = postStart + 'post {'.length;
  while (i < pipelineOnlyBody.length && braceCount > 0) {

    if (pipelineOnlyBody[i] === '{') braceCount++;
    else if (pipelineOnlyBody[i] === '}') braceCount--;
    i++;
  }
  pipelinePostBody = pipelineOnlyBody.slice(postStart + 'post {'.length, i - 1);
}

let pipelineAgentType = 'any';
let pipelineAgentDetail = '';

const dockerfileMatch = pipelineOnlyBody.match(/agent\s*\{\s*dockerfile\s*\{\s*filename\s*['"](.+?)['"]\s*\}\s*\}/);
if (dockerfileMatch) {

  pipelineAgentType = 'dockerfile';
  pipelineAgentDetail = dockerfileMatch[1];

} else {

  const dockerMatch = pipelineOnlyBody.match(/agent\s*\{\s*docker\s*\{\s*image\s*['"](.+?)['"]\s*\}\s*\}/);
  const labelMatch = pipelineOnlyBody.match(/agent\s*\{\s*label\s*['"](.+?)['"]\s*\}/);
  const simpleAgentMatch = pipelineOnlyBody.match(/agent\s+(\w+)/);

  if (dockerMatch) {
    pipelineAgentType = 'docker';
    pipelineAgentDetail = dockerMatch[1];

  } else if (labelMatch) {

    pipelineAgentType = 'label';
    pipelineAgentDetail = labelMatch[1];

  } else if (simpleAgentMatch) {

    pipelineAgentType = simpleAgentMatch[1];
    pipelineAgentDetail = '';
  }
}

boxes[0].agentType = pipelineAgentType;
boxes[0].agentDetail = pipelineAgentDetail;




}


const pipelineEnvMatch = pipelineOnlyBody.match(/environment\s*\{([\s\S]*?)\}/);

if (pipelineEnvMatch) {
  const envLines = pipelineEnvMatch[1].split('\n')
    .map(line=> line.trim())
    .filter(line=> line && !line.startsWith('//'));

  const pipelineEnv = envLines.map(line=> {
    const [key, ...rest] = line.split('=');
    return {

      key: key.trim(),
      value: rest.join('=').trim().replace(/^['"]|['"]$/g, '')
    };
  });

  boxes[0].environment = pipelineEnv;
}

if (pipelineEnvMatch) {

  const envLines = pipelineEnvMatch[1].split('\n')
    .map(line=> line.trim())
    .filter(line=> line && !line.startsWith('//'));

  const pipelineEnv = envLines.map(line => {
    const [key, ...rest] = line.split('=');
    return {
      key: key.trim(),
      value: rest.join('=').trim().replace(/^['"]|['"]$/g, '')
    };
  });

  boxes[0].environment = pipelineEnv;


}
  const stageLabels = [];
  const stagesBoxId = generateId();

  const stageRegex = /stage\s*\(\s*['"](.+?)['"]\s*\)\s*\{/g;

  let stageMatch;
  let stageY = 400;
  let stageIndex = 0;

  while ((stageMatch = stageRegex.exec(jenkinsfileText)) !== null) {

    const [, stageName] = stageMatch;
    const startIndex = stageMatch.index + stageMatch[0].length;

    let braceCount = 1;
    let currentIndex = startIndex;

    while (braceCount > 0 && currentIndex < jenkinsfileText.length) {

      const char = jenkinsfileText[currentIndex];
      if (char === '{') braceCount++;
      else if (char === '}') braceCount--;
      currentIndex++;
    }

    const stageBlock = jenkinsfileText.slice(startIndex, currentIndex - 1);

let agentType = '';
let agentDetail = '';

const labelMatch = stageBlock.match(/agent\s*\{\s*label\s*['"](.+?)['"]\s*\}/);

if (labelMatch) {
  agentType = 'label';
  agentDetail = labelMatch[1];
} else {

const stageAgentBlock = stageBlock.match(/agent\s*\{\s*([a-z]+)\s*\{\s*([a-z]+)\s*['"](.+?)['"]\s*\}\s*\}/);
const simpleAgentMatch = stageBlock.match(/^\s*agent\s+(any|none)\s*$/m);

if (stageAgentBlock) {
  const [, agentKind, agentProp, value] = stageAgentBlock;
  if (agentKind === 'docker' && agentProp === 'image') {

    agentType = 'docker';
    agentDetail = value;

  } else if (agentKind === 'dockerfile' && agentProp === 'filename') {

    agentType = 'dockerfile';
    agentDetail = value;

  } else if (agentKind === 'label') {

    agentType = 'label';
    agentDetail = value;
  }

} else if (simpleAgentMatch) {
  agentType = simpleAgentMatch[1]; 
  agentDetail = '';
}
}

    const envMatch = stageBlock.match(/environment\s*\{([\s\S]*?)\}/);
let stageEnv = [];

if (envMatch) {

  const envLines = envMatch[1].split('\n')
    .map(line=> line.trim())
    .filter(line=> line && !line.startsWith('//'));

  stageEnv = envLines.map(line=> {
    const [key, ...rest] = line.split('=');
    return {
      key: key.trim(),
      value: rest.join('=').trim().replace(/^['"]|['"]$/g, '')
    };
  });
}



    const stepMatch = stageBlock.match(/steps\s*\{([\s\S]*?)\}/);


    stageLabels.push(stageName || 'Unnamed Stage');

    const stageId = generateId();
    boxes.push({ id: stageId, type: 'stage', label: stageName,position: { x: 300, y: stageY }, agentType,agentDetail,environment: stageEnv});

    connections.push({
      from: `stages-box-${stagesBoxId}-stage-${stageIndex}`,
      to: `stage-box-${stageId}-in`,
    });

    if (stepMatch) {
      const stepBody = stepMatch[1];
      const lines = stepBody.split('\n')
        .map(line=> line.trim())
        .filter(line=> line && !line.startsWith('//'));

      const steps = lines.map(line=> {
        const type = line.split(' ')[0];
        const value = line.slice(type.length).trim().replace(/^['"]|['"]$/g, '');
        return { type, value };
      });

      const stepId = generateId();
      boxes.push({id: stepId, type: 'step', steps, position: { x: 420,y: stageY }});

      connections.push({
        from: `stage-box-${stageId}-out`,
        to: `step-box-${stepId}-target`,
      });
    }
      const postStart = stageBlock.indexOf('post {');
  if (postStart !== -1) {

    let braceCount = 1;
    let i= postStart + 'post {'.length;
    while (i < stageBlock.length && braceCount > 0) {
      if (stageBlock[i]=== '{') braceCount++;
      else if (stageBlock[i] === '}') braceCount--;
      i++;
    }
    const postBody = stageBlock.slice(postStart + 'post {'.length, i - 1);

    if (postBody) {
      

  const conditionRegex = /(\w+)\s*\{([\s\S]*?)\}/g;

  let condMatch;
  let conditionIndex = 0;

  const postBoxId = generateId();
  const postConditions = [];

const postStepsByCondition = {};



while ((condMatch = conditionRegex.exec(postBody)) !== null) {
  const [, condition, block] = condMatch;
  postConditions.push(condition);

  const lines = block.split('\n')
    .map(line=> line.trim())
    .filter(line=> line && !line.startsWith('//'));

  const steps = lines.map(line=> {

    const type = line.split(' ')[0];
    const value = line.slice(type.length).trim().replace(/^['"]|['"]$/g, '');
    return { type, value };
  });



  if (steps.length) {
    postStepsByCondition[condition] = steps;

    const stepBoxId = generateId();
    boxes.push({
      id: stepBoxId,
      type: 'step',
      steps,
      position: { x: 520, y: 150 + conditionIndex * 100 },
    });

    connections.push({
      from: `post-box-${postBoxId}-condition-${conditionIndex}`,
      to: `step-box-${stepBoxId}-target`,
    });
  }

  conditionIndex++;
}


  if (postConditions.length > 0) {
    boxes.push({id: postBoxId, type: 'post', position: { x: 320, y: stageY + 50 }, conditions: postConditions});

    connections.push({

      from: `stage-box-${stageId}-post-in`,
      to: `pipeline-box-${postBoxId}-pipeline-in`,
    });
  }
}
  }
    
    stageY += 350;
    stageIndex++;
  }

  boxes.push({id: stagesBoxId, type: 'stages', stages: stageLabels.map((_, i)=> ({ label: `Stage ${i + 1}` })), position: { x: 100, y: 250 }});
  

  connections.push({
    from: `pipeline-box-${pipelineId}-out`,
    to: `stages-box-${stagesBoxId}-in`,
  });


//const pipelinePostStart= jenkinsfileText.indexOf('post {');

//let pipelinePostBody = '';

// if (pipelinePostStart !== -1) {
//   let braceCount = 1;
//   let i = pipelinePostStart + 'post {'.length;
//   while (i < jenkinsfileText.length && braceCount > 0) {
//     if (jenkinsfileText[i]=== '{') braceCount++;
//     else if (jenkinsfileText[i] === '}') braceCount--;
//     i++;
//   }
//   pipelinePostBody= jenkinsfileText.slice(pipelinePostStart + 'post {'.length, i - 1);
// }
if (pipelinePostBody) {


  const conditionRegex = /(\w+)\s*\{([\s\S]*?)\}/g;
  let condMatch;
  let conditionIndex = 0;

  const postBoxId = generateId();
  const postConditions = [];
  const postStepsByCondition = {};

  while ((condMatch = conditionRegex.exec(pipelinePostBody)) !== null) {
    const [, condition, block] = condMatch;

    postConditions.push(condition);

    const lines = block.split('\n')
      .map(line=> line.trim())
      .filter(line=> line && !line.startsWith('//'));

    const steps = lines.map(line=> {
      const type = line.split(' ')[0];
      const value = line.slice(type.length).trim().replace(/^['"]|['"]$/g, '');
      return { type, value };
    });


    if (steps.length) {
      postStepsByCondition[condition] = steps;

      const stepBoxId = generateId();
      boxes.push({
        id: stepBoxId,
        type: 'step',
        steps,
        position: { x: 520,y: 150 + conditionIndex * 100 },
      });

      connections.push({
        from: `post-box-${postBoxId}-condition-${conditionIndex}`,
        to: `step-box-${stepBoxId}-target`,
      });
    }

    conditionIndex++;

  }


  if (postConditions.length > 0) {
    boxes.push({id: postBoxId,type: 'post', position: { x: 320, y: 150 }, conditions: postConditions});

    connections.push({
      from: `pipeline-box-${pipelineId}-post-in`,
      to: `pipeline-box-${postBoxId}-pipeline-in`,
    });

    boxes[0].post = postStepsByCondition;
    
  } 
}


  return { boxes, connections };
  
}
