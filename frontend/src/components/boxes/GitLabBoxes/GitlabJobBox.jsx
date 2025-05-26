import React, { useState, useEffect } from 'react';
import { useDraggable } from '@dnd-kit/core';
import closeIcon from '../../../assets/close-ellipse-svgrepo-com.svg';
import addIcon from '../../../assets/add-ellipse-svgrepo-com.svg';


export default function JobBox({ id, position,jobName = '', stage = '',image: initialImage = '', onDelete, onDotClick,activeConnector, isDotConnected, onUpdate}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({id});

  const [jobNameState, setJobName] = useState(jobName);
  const [image, setImage] = useState(initialImage);
  const [stageState, setStage] = useState(stage); 
  const [showImageInput, setShowImageInput] = useState(false);
  const leftDotId = `job-box-${id}-in`;
  const rightDotId = `job-box-${id}-out`;
  const isLeftActive = activeConnector === leftDotId || isDotConnected(leftDotId);
  const isRightActive = activeConnector === rightDotId || isDotConnected(rightDotId);

  const x = transform ? position.x + transform.x : position.x;
  const y = transform ? position.y + transform.y : position.y;

  useEffect(()=> {

    onUpdate?.(id, { jobName: jobNameState, image, stage: stageState });
  }, [jobNameState, image, stageState]);

  useEffect(()=> {
    
    onUpdate?.(id, { jobName: jobNameState, image, stage: stageState });
    setShowImageInput(image !== '');
  }, [jobNameState, image, stageState]);

  return (
    <div
      ref={setNodeRef}
      style={{transform: `translate(${x}px, ${y}px)`, position: 'absolute',background: '#B4DAEC', padding: '1rem', borderRadius: '8px', boxShadow: '0 2px 6px rgba(0,0,0,0.2)',minWidth: '320px'}}>
      <img
        src={closeIcon}
        alt="delete"
        onClick={()=> onDelete(id)}
        style={{position: 'absolute',top: '-10px', right: '-10px', width: '24px', height: '24px', cursor: 'pointer'}}/>


   <div {...listeners} {...attributes} style={{ cursor: 'grab', marginBottom: '8px' }}>
      <h3 style={{ textAlign: 'center', margin: 0 }}>Job</h3>
  </div>


      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
        <label style={{ width: '90px' }}>Name</label>
        <input
          value={jobNameState.trim() === '' ? 'job' : jobNameState}
          onChange={(e)=> {

            const value = e.target.value;
            setJobName(value);
            onUpdate(id, { jobName: value });
          }}
          placeholder="e.g., test-job"
          
          style={{ flex: 1, padding: '6px', border: '1px solid #ccc', background: '#F2FBFF' }}/>
      </div>


      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem'  }}>
        <label style={{ width: '90px' }}>Stage</label>
        <input
          value={stageState}
          onChange={(e)=> {

             const value = e.target.value;
             setStage(value);
             onUpdate(id, { stage: value });
          }}

          placeholder="e.g., build"
          style={{ flex: 1, padding: '6px', border: '1px solid #ccc', background: '#F2FBFF' }}/>
      </div>


{showImageInput && (
  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
    <label style={{ width: '90px' }}>Image</label>
    <input
      value={image}
      onChange={(e)=> setImage(e.target.value)}
      placeholder="e.g., node:18"
      style={{ flex: 1, padding: '6px', border: '1px solid #ccc', background: '#F2FBFF' }}
    />
    <img
      src={closeIcon}
      alt="delete"
      onClick={()=> {
        setImage('');
        setShowImageInput(false);
      }}
      style={{
        marginLeft: '8px',
        width: '20px',
        height: '20px',
        cursor: 'pointer',
      }}
    />
  </div>
)}


{!showImageInput && (
  <div
    onClick={()=> setShowImageInput(true)}
    style={{display: 'flex', alignItems: 'center', cursor: 'pointer', marginBottom: '10px' }}>
    <img
  src={addIcon}
  alt="add"
  style={{ width: '20px', height: '20px', marginRight: '8px' }}/>

    <span><strong>Add Image</strong></span>
  </div>

)}


      


      <div
        id={leftDotId}
        onClick={()=> onDotClick(leftDotId)}
        style={{width: '12px', height: '12px', backgroundColor: 'red', borderRadius: '50%', position: 'absolute',left: '-10px', top: '50%',transform: 'translateY(-50%)', cursor: 'pointer', border: isLeftActive ? '2px solid black' : 'none'}}/>
      <div
        id={rightDotId}
        onClick={()=> onDotClick(rightDotId)}
        style={{ width: '12px', height: '12px', backgroundColor: 'red', borderRadius: '50%', position: 'absolute', right: '-10px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', border: isRightActive ? '2px solid black' : 'none'}}/>

<div
  id={`job-box-${id}-top`}
  onClick={()=> onDotClick(`job-box-${id}-top`)}
  style={{width: '12px', height: '12px', backgroundColor: 'red', borderRadius: '50%',  position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', cursor: 'pointer', border: isDotConnected(`job-box-${id}-top`) ? '2px solid black' : 'none' }}/>


<div
  id={`job-box-${id}-bottom`}
  onClick={()=> onDotClick(`job-box-${id}-bottom`)}
  style={{ width: '12px',height: '12px', backgroundColor: 'red', borderRadius: '50%', position: 'absolute',bottom: '-10px', left: '50%', transform: 'translateX(-50%)', cursor: 'pointer', border: isDotConnected(`job-box-${id}-bottom`) ? '2px solid black' : 'none',}}/>
    </div>
  );
}
