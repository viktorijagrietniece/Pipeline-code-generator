export default function generateJenkinsfileFromState(boxes, connections) {
  const getBoxById = (id)=> boxes.find((b)=> b.id === id);
  const getBoxIdFromDot = (dotId)=> {

    const match = dotId.match(/box-\d+/);
    return match ? match[0] : null;

  };

  const pipelineBox = boxes.find((b)=> b.type === 'pipeline');
  const stagesBox = boxes.find((b)=> b.type === 'stages');

  const pipeline = {
    agent: {
      [pipelineBox?.agentType || 'any']: pipelineBox?.agentDetail || ''
    },
    post: pipelineBox?.post || {},
    environment: pipelineBox?.environment || [],
    stages: []

  };

  const stageConnections = connections.filter(conn=>
    conn.from.includes(stagesBox?.id) || conn.to.includes(stagesBox?.id)
  );

  stageConnections.forEach((conn)=> {

    const stageId = getBoxIdFromDot(conn.from.includes(stagesBox.id) ? conn.to : conn.from);
    const stageBox = getBoxById(stageId);
    if (!stageBox || stageBox.type !== 'stage') return;

    const stage = {
      
      name: stageBox.label || 'Stage',
      agent: stageBox.agentType && stageBox.agentType !== 'none' ? { [stageBox.agentType]: stageBox.agentDetail } : undefined,
      environment: stageBox.environment || [],
      steps: []
    };

    const stepConn = connections.find(c=>
      c.from.includes(stageBox.id) || c.to.includes(stageBox.id)
    );

    const stepId = getBoxIdFromDot(stepConn?.from.includes(stageBox.id) ? stepConn.to : stepConn.from);
    const stepBox = getBoxById(stepId);
    if (stepBox && stepBox.type === 'step' && Array.isArray(stepBox.steps)) {
      stage.steps = stepBox.steps;
    }

    pipeline.stages.push(stage);
  });

  return pipeline;
}
