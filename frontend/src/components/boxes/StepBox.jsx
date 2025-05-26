import React, { useState, useEffect, useRef } from 'react';
import { useDraggable } from '@dnd-kit/core';
import closeIcon from '../../assets/close-ellipse-svgrepo-com.svg';
import addIcon from '../../assets/add-ellipse-svgrepo-com.svg';

export default function StepBox({ id, position, onDelete, onDotClick, activeConnector, isDotConnected, onUpdate, steps: initialSteps}) {
  
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });

  const [steps, setSteps] = useState(()=> Array.isArray(initialSteps) ? initialSteps : [{ type: 'sh', value: '' }]);
  const didMount = useRef(false);


  const stepOptions = ['sh','echo','input','bat','timeout','retry'];

  const dotId = `step-box-${id}-target`;
const isActive = activeConnector === dotId || isDotConnected(dotId);

const handleAddStep = ()=> {

    setSteps(prev=> [...prev, { type: 'sh', value: '' }]);
  };
  
  const handleStepChange = (index, field, newValue)=> {

    setSteps(prev=>
      prev.map((step, i)=>
        i === index ? { ...step, [field]: newValue } : step
      )
    );
  };
  useEffect(()=> {

    if (didMount.current && typeof onUpdate === 'function') {
      onUpdate(id, { steps });
    }
  }, [steps]);
  
  
  

  const x = transform ? position.x + transform.x : position.x;
  const y = transform ? position.y + transform.y : position.y;

  const wrapperStyle = {transform: `translate(${x}px, ${y}px)`, position: 'absolute',background: '#EFE9FC', padding: '1rem', borderRadius: '8px', boxShadow: '0 2px 6px rgba(0,0,0,0.2)', minWidth: '320px'};

  const deleteStyle = {position: 'absolute', top: '-10px',right: '-10px', width: '24px',height: '24px', cursor: 'pointer',zIndex: 10,pointerEvents: 'auto'};

  const handleKeyDown = (e)=> {

    if (e.key === 'Enter') {
      e.target.blur();
    }
  };
  const handleDeleteStep = (index)=> {

    setSteps(prev => prev.filter((_, i)=> i !== index));
  };
  
  useEffect(()=> {

    didMount.current = true;
  }, []);
  
  return (
    
    <div ref={setNodeRef} style={wrapperStyle}>
      <img
        src={closeIcon}
        alt="delete"
        onClick={()=> onDelete(id)}
        style={deleteStyle}
      />

      <div {...listeners} {...attributes} style={{ cursor: 'grab', marginBottom: '8px' }}>
        <h3 style={{ textAlign: 'center', margin: 0 }}>Steps</h3>
      </div>

      

      <h4 style={{ marginTop: '1rem' }}></h4>
      
      <div
  id={`step-box-${id}-target`}
  style={{width: '12px',height: '12px',backgroundColor: 'red', borderRadius: '50%', position: 'absolute',left: '-6px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer'}}

  onClick={()=> onDotClick?.(`step-box-${id}-target`)}
/>

<div
  onClick={handleAddStep}
  style={{display: 'flex',alignItems: 'center', cursor: 'pointer',marginBottom: '10px'}}>
<img
          src={addIcon}
          alt="add"
          style={{ width: '20px',height: '20px', marginRight: '8px', cursor: 'pointer'}}/>
        <span><strong>Add Step</strong></span>
</div>

{steps.map((step, index)=> (
  <div
    key={index}
    style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', position: 'relative' }}>
    <select
      value={step.type}
      onChange={(e)=> handleStepChange(index, 'type', e.target.value)}
      style={{padding: '4px', marginRight: '8px', border: '1px solid #ccc'}}>
      {stepOptions.map((option)=> (
        <option key={option} value={option}>{option}</option>
      ))}
    </select>

    <input
      type="text"
      value={step.value}
      onChange={(e)=> handleStepChange(index, 'value', e.target.value)}
      placeholder={`e.g., ${
        step.type === 'sh' ? 'npm install' :
        step.type === 'echo' ? 'Hello world' :
        step.type === 'input' ? 'Deploy to prod?' : ''
      }`}
      style={{flex: 1, padding: '4px',border: '1px solid #ccc', background: '#F6F4FF'}}/>

    <img
      src={closeIcon}
      alt="delete step"
      onClick={()=> handleDeleteStep(index)}
      style={{ width: '18px', height: '18px', marginLeft: '8px', cursor: 'pointer'}}/>
  </div>
))}



   
      <div
  id={dotId}
  onClick={()=> onDotClick(`step-box-${id}-target`)}
  style={{width: '12px',height: '12px', backgroundColor: 'red', borderRadius: '50%', position: 'absolute',left: '-10px',top: '70px', transform: 'translateY(-50%)', cursor: 'pointer', border: isActive ? '2px solid black' : 'none'}}/>


    </div>
    
  );
}
