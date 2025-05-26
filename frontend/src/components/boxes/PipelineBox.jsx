import React, {useState, useEffect} from 'react';
import { useDraggable } from '@dnd-kit/core';
import closeIcon from '../../assets/close-ellipse-svgrepo-com.svg';
import addIcon from '../../assets/add-ellipse-svgrepo-com.svg';

export default function PipelineBox({id, position,onDelete, onDotClick, activeConnector, isDotConnected, onUpdate, environment = [], agentType: agentTypeProp,agentDetail: agentDetailProp}) {
  const {attributes, listeners, setNodeRef, transform} = useDraggable({id});
  const [agentType, setAgentType] = useState(()=> agentTypeProp || 'any');
  const [agentDetail, setAgentDetail] = useState(()=> agentDetailProp || '');  
  const [envVars, setEnvVars] = useState(environment || []);
  const dotId = `pipeline-box-${id}-out`;
  const isActive = activeConnector === dotId || isDotConnected(dotId);
  const postTargetId = `pipeline-box-${id}-post-in`;
  const isPostTargetActive = activeConnector === postTargetId || isDotConnected(postTargetId);
  const [showAddOptions, setShowAddOptions] = useState(false);
  const agentOptions = ['any', 'none', 'label', 'docker', 'dockerfile'];
  const x = transform ? position.x + transform.x : position.x;
  const y = transform ? position.y + transform.y : position.y;

  const wrapperStyle ={transform: `translate(${x}px, ${y}px)`,position: 'absolute',background: '#978BCC', padding: '1rem',borderRadius: '8px', boxShadow: '0 2px 6px rgba(0,0,0,0.2)',minWidth: '320px'};



  const deleteStyle = {position: 'absolute',top: '-10px',right: '-10px', width: '24px', height: '24px',cursor: 'pointer', zIndex: 10, pointerEvents: 'auto'};

  const handleKeyDown = (e)=> {

    if (e.key === 'Enter'){
      e.target.blur();
    }

  };

  const handleAddEnv = ()=> {

    setEnvVars(prev=>[...prev,{ key: '', value: '' }]);

  };
  
  const handleEnvChange = (index, field, value)=> {

    setEnvVars(prev=>
      prev.map((env, i)=>
        i === index ? { ...env, [field]: value } : env
      )
    );

  };

  useEffect(()=>{

    onUpdate?.(id, {
      agentType,
      agentDetail,
      environment: envVars,
    });
  }, [agentType, agentDetail, envVars]);

  const handleDeleteEnv = (index)=>{

    setEnvVars(prev=> prev.filter((_, i)=> i !== index));
  };
  
  useEffect(()=> {

    if (environment?.length){
      setEnvVars(environment);
    }
  }, [environment]);
  

  return (
    <div ref={setNodeRef} style={wrapperStyle}>
      <img
        src={closeIcon}
        alt="delete"
        onClick={()=> onDelete(id)}
        style={deleteStyle}/>
      <div {...listeners} {...attributes} style={{ cursor: 'grab', marginBottom: '8px' }}>
        <h3 style={{ textAlign: 'center', margin: 0 }}>Pipeline</h3>
      </div>
      <div style={{ display: 'flex', alignItems: 'center',marginBottom: '0.5rem' }}>
        <label style={{ width: '90px' }}>Agent</label>
        <select
          value={agentType}
          onChange={(e)=> {
            setAgentType(e.target.value);
            setAgentDetail('');
          }}
          style={{flex: 1, padding: '6px', border: '1px solid #ccc', background: '#F6F4FF'}}>
          {agentOptions.map((option)=> (

            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
      {['label', 'docker','dockerfile'].includes(agentType)&& (
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
          <label style={{ width: '90px' }}>Value</label>
          <input
            value={agentDetail}
            onChange={(e)=> setAgentDetail(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={agentType === 'label' ? 'e.g., linux' : 'e.g., node:14-alpine'}
            style={{flex: 1,padding: '6px', border: '1px solid #ccc', background: '#f3f3f3'}}/>
        </div>
      )}


<div
  onClick={handleAddEnv}
  style={{display: 'flex', alignItems: 'center', cursor: 'pointer', marginBottom: '10px'}}>
<img
                src={addIcon}
                alt="add"
                style={{width: '20px', height: '20px',marginRight: '8px', cursor: 'pointer'}}/>
  <span><strong>Add Environment</strong></span>
</div>

<h4 style={{ marginTop: '1rem' }}></h4>
{envVars.map((env, index)=> (
  <div
    key={index}
    style={{ display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
    <input
      value={env.key}
      onChange={(e)=> handleEnvChange(index, 'key', e.target.value)}
      placeholder="KEY"
      style={{width: '35%', padding: '6px', marginRight: '4px', border: '1px solid #ccc',background: '#F6F4FF'}}/>
    <span>=</span>
    <input
      value={env.value}
      onChange={(e)=> handleEnvChange(index, 'value', e.target.value)}
      placeholder="VALUE"
      style={{width: '45%', padding: '6px', marginLeft: '4px', border: '1px solid #ccc', background: '#F6F4FF'}}/>
<img
  src={closeIcon}
  alt="delete"
  onClick={()=> handleDeleteEnv(index)}
  style={{marginLeft: '8px', width: '20px', height: '20px', cursor: 'pointer'}}/>
  </div>
))}





<div
  id= {dotId}
  onClick={()=> onDotClick(dotId)}
  style={{width: '12px', height: '12px', backgroundColor: 'red', border: isActive ? '2px solid black' : 'none',borderRadius: '50%',position: 'absolute', right: '-10px',top: '75px', transform: 'translateY(-50%)', cursor: 'pointer'}}/>

<div
  id={postTargetId}
  onClick={()=> onDotClick(postTargetId)}
  style={{width: '12px',height: '12px', backgroundColor: 'red',border: isPostTargetActive ? '2px solid black' : 'none', borderRadius: '50%', position: 'absolute', left: '20px', bottom: '-8px', cursor: 'pointer'}}/>


    </div>
  );
}
