import React, { useState, useEffect } from 'react';
import { useDraggable } from '@dnd-kit/core';
import closeIcon from '../../assets/close-ellipse-svgrepo-com.svg';
import addIcon from '../../assets/add-ellipse-svgrepo-com.svg';

export default function StageBox({id, position, onDelete, onDotClick, activeConnector, isDotConnected, onUpdate, label: labelProp, environment = [], agentType: agentTypeProp, agentDetail: agentDetailProp}) {

  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });

  const [label, setLabel] = useState(()=> {
    return typeof labelProp === 'string' && labelProp.trim() !== '' ? labelProp : '';
  });
  

  const [envVars, setEnvVars] = useState(environment || []);
  const [agentType, setAgentType] = useState(()=> agentTypeProp || '');
  const [agentDetail, setAgentDetail] = useState(()=> agentDetailProp || '');

  const leftDotId = `stage-box-${id}-in`;
  const rightDotId = `stage-box-${id}-out`;
  const isLeftActive = activeConnector === leftDotId || isDotConnected(leftDotId);
  const isRightActive = activeConnector === rightDotId || isDotConnected(rightDotId);

  const x = transform ? position.x + transform.x : position.x;
  const y = transform ? position.y + transform.y : position.y;

  const wrapperStyle= {transform: `translate(${x}px, ${y}px)`, position: 'absolute',background: '#C8C0E8', padding: '1rem', borderRadius: '8px', boxShadow: '0 2px 6px rgba(0,0,0,0.2)', minWidth: '320px'};

  const handleKeyDown = (e)=> {
    
    if (e.key === 'Enter') {
      e.target.blur();
    }

  };

  const handleAddEnv = ()=> {

    setEnvVars((prev)=> [...prev, { key: '', value: '' }]);
  };

  const handleEnvChange = (index, field, value)=> {

    setEnvVars((prev)=>
      prev.map((env, i)=> (i === index ? { ...env, [field]: value } : env))
    );

  };

  const handleDeleteEnv = (index)=> {

    setEnvVars((prev) => prev.filter((_, i)=> i !== index));
  };
  useEffect(()=> {
    onUpdate?.(id, {
      label,
      agentType,
      agentDetail,
      environment: envVars,
    });
  }, [label, agentType, agentDetail, envVars]);
  
  useEffect(()=> {
    if (environment?.length) {
      setEnvVars(environment);
    }
  }, [environment]);
  
  return (
    <div ref={setNodeRef} style={wrapperStyle}>

      <img
        src={closeIcon}
        alt="delete"
        onClick={()=> onDelete(id)}
        style={{position: 'absolute', top: '-10px', right: '-10px', width: '24px', height: '24px', cursor: 'pointer',zIndex: 10}}/>


      <div {...listeners} {...attributes} style={{ cursor: 'grab', marginBottom: '8px' }}>
        <h3 style={{ textAlign: 'center', margin: 0 }}>Stage</h3>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
        <label style={{ width: '90px' }}>Name</label>
        <input
          value={label}
          onChange={(e)=> setLabel(e.target.value)}
          placeholder="e.g., Build or Test"
          onKeyDown={handleKeyDown}
          style={{flex: 1, padding: '6px', border: '1px solid #ccc', background: '#F6F4FF'}}/>
      </div>


      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
        <label style={{ width: '90px' }}>Agent</label>
        <select
          value={agentType}
          onChange={(e)=> {
            setAgentType(e.target.value);
            setAgentDetail('');
          }}
          style={{flex: 1, padding: '6px', border: '1px solid #ccc', background: '#F6F4FF'}}>
          {[ ' ','any', 'none', 'label', 'docker', 'dockerfile'].map((type)=>(
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {(agentType === 'label' || agentType === 'docker' || agentType === 'dockerfile') && (
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
          <label style={{ width: '90px' }}>Value</label>
          <input
            value={agentDetail}
            onChange={(e)=> setAgentDetail(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              agentType === 'label'
                ? 'e.g., linux'
                : agentType === 'docker'
                ? 'e.g., node:14'
                : 'e.g., Dockerfile'
            }
            style={{flex: 1, padding: '6px', border: '1px solid #ccc', background: '#f3f3f3'}}/>
        </div>
      )}

      <div
        onClick={handleAddEnv}
        style={{display: 'flex', alignItems: 'center', cursor: 'pointer', marginBottom: '10px'}}>
        <img
          src={addIcon}
          alt="add"
          style={{width: '20px', height: '20px', marginRight: '8px', cursor: 'pointer'}}/>
        <span><strong>Add Environment</strong></span>
      </div>

      {envVars.map((env, index)=> (
        <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
          <input
            value={env.key}
            onChange={(e)=> handleEnvChange(index, 'key', e.target.value)}
            placeholder="KEY"
            style={{width: '35%', padding: '6px', marginRight: '4px',border: '1px solid #ccc', background: '#e6f2ff'}}/>
          <span>=</span>
          <input
            value={env.value}
            onChange={(e)=> handleEnvChange(index, 'value', e.target.value)}
            placeholder="VALUE"
            style={{width: '45%', padding: '6px', marginLeft: '4px', border: '1px solid #ccc', background: '#e6f2ff'}}/>
          <img
            src={closeIcon}
            alt="delete env"
            onClick={()=> handleDeleteEnv(index)}
            style={{marginLeft: '8px', width: '20px',height: '20px',cursor: 'pointer'}}
          />
        </div>
      ))}

      <div
        id={leftDotId}
        onClick={()=> onDotClick(leftDotId)}
        style={{width: '12px', height: '12px',backgroundColor: 'red',border: isLeftActive ? '2px solid black' : 'none', borderRadius: '50%', position: 'absolute', left: '-10px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer'}}/>
      <div
        id={rightDotId}
        onClick={()=> onDotClick(rightDotId)}
        style={{width: '12px',height: '12px', backgroundColor: 'red', border: isRightActive ? '2px solid black' : 'none', borderRadius: '50%', position: 'absolute', right: '-10px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer'}}/>

<div
  id={`stage-box-${id}-post-in`}
  onClick={()=> onDotClick(`stage-box-${id}-post-in`)}
  style={{width: '12px',height: '12px', backgroundColor: 'red',border: isDotConnected(`stage-box-${id}-post-in`) ? '2px solid black' : 'none', borderRadius: '50%',position: 'absolute', left: '20px', bottom: '-8px', cursor: 'pointer'}}/>

    </div>
    
  );
}
