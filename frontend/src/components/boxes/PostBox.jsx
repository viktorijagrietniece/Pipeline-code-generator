import React, { useState, useEffect } from 'react';
import { useDraggable } from '@dnd-kit/core';
import closeIcon from '../../assets/close-ellipse-svgrepo-com.svg';
import addIcon from '../../assets/add-ellipse-svgrepo-com.svg';

export default function PostBox({id, position, onDelete, onDotClick, activeConnector,isDotConnected, onUpdate, conditions: initialConditions = []}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });
  const [conditions, setConditions] = useState(()=> initialConditions);
  useEffect(()=> {
    if (typeof onUpdate === 'function') {
      onUpdate(id, { conditions });
    }
  }, [conditions]);
  
  const pipelineTargetId = `pipeline-box-${id}-pipeline-in`;
  const isPipelineTargetActive = activeConnector === pipelineTargetId || isDotConnected(pipelineTargetId);

  const postOptions = [
    'always',
    'success',
    'failure',
    'unstable',
    'aborted',
    'changed',
    'fixed',
    'regression',
    'cleanup',
  ];

  const x = transform ? position.x + transform.x : position.x;
  const y = transform ? position.y + transform.y : position.y;

  const wrapperStyle= {transform: `translate(${x}px, ${y}px)`, position: 'absolute',background: '#DCD4F2', padding: '1rem', borderRadius: '8px', boxShadow: '0 2px 6px rgba(0,0,0,0.2)', minWidth: '320px',};


  const deleteStyle = { position: 'absolute',top: '-10px', right: '-10px',width: '24px', height: '24px', cursor: 'pointer', zIndex: 10, pointerEvents: 'auto'};

  const handleAddCondition = ()=> {

    setConditions((prev)=> [...prev, 'always']);
  };

  const handleChange = (index, newValue)=> {

    setConditions((prev)=>
      prev.map((cond, i)=> (i === index ? newValue : cond))
    );

  };  
  
  const handleDeleteCondition = (indexToDelete)=> {

    setConditions((prev)=> prev.filter((_, i)=> i !== indexToDelete));

  };
  

  return (
    <div ref={setNodeRef} style={wrapperStyle}>

      <img
        src={closeIcon}
        alt="delete"
        onClick={()=> onDelete(id)}
        style={deleteStyle}
      />

      <div {...listeners} {...attributes} style={{ cursor: 'grab', marginBottom: '8px' }}>
        <h3 style={{ textAlign: 'center', margin: 0 }}>Post</h3>
      </div>

      <div
        style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', marginBottom: '10px' }}
        onClick={handleAddCondition}
      >
        <img
          src={addIcon}
          alt="add"
          style={{width: '20px',  height: '20px', marginRight: '8px', cursor: 'pointer'}}/>
        <span><strong>Add Condition</strong></span>
      </div>


      {conditions.map((condition, index)=> {
        const dotId = `post-box-${id}-condition-${index}`;
        const isActive = activeConnector === dotId || isDotConnected(dotId);
        
        return (
            <div
            key={`condition-${index}`}
            style={{display: 'flex',alignItems: 'center', marginBottom: '0.5rem',  position: 'relative'}}>
            <label style={{ width: '100px' }}>Condition</label>
            <select
              value={condition}
              onChange={(e)=> handleChange(index, e.target.value)}
              style={{flex: 1,  padding: '6px',  border: '1px solid #ccc', background: '#F6F4FF'}}>
              {postOptions.map((opt)=> (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>

            <img
              src={closeIcon}
              alt="delete condition"
              onClick={()=> handleDeleteCondition(index)}
              style={{ width: '18px', height: '18px', marginLeft: '8px', cursor: 'pointer'}}/>

            <div
              id={`post-box-${id}-condition-${index}`}
              onClick={()=> onDotClick(`post-box-${id}-condition-${index}`)}
              style={{ width: '12px',height: '12px', backgroundColor: 'red', borderRadius: '50%', position: 'absolute',right: '-23px', top: '50%',  transform: 'translateY(-50%)', cursor: 'pointer', border: isActive ? '2px solid black' : 'none'}}/>
          </div>
          
        );
})}
<div
  id={pipelineTargetId}
  onClick={()=> onDotClick(pipelineTargetId)}
  style={{width: '12px', height: '12px', backgroundColor: 'red',border: isPipelineTargetActive ? '2px solid black' : 'none', borderRadius: '50%', position: 'absolute', top: '-6px', left: '20px', cursor: 'pointer'}}/>

    </div>
  );
}
