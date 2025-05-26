import React, { useState, useEffect } from 'react';
import { useDraggable } from '@dnd-kit/core';
import closeIcon from '../../../assets/close-ellipse-svgrepo-com.svg';
import addIcon from '../../../assets/add-ellipse-svgrepo-com.svg';

export default function GitlabPipelineBox({id, position, image: initialImage='', label, onDelete, onDotClick, activeConnector,isDotConnected, onUpdate}){
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });

  const [image, setImage] = useState(initialImage || null);

  const dotId = `gitlab-pipeline-box-${id}-out`;
  const topDotId = `gitlab-pipeline-box-${id}-top`;
  const bottomDotId = `gitlab-pipeline-box-${id}-bottom`;

  const isActive = activeConnector === dotId || isDotConnected(dotId);
  const isTopActive = activeConnector === topDotId || isDotConnected(topDotId);
  const isBottomActive = activeConnector === bottomDotId || isDotConnected(bottomDotId);

  const x = transform ? position.x + transform.x : position.x;
  const y = transform ? position.y + transform.y : position.y;


  useEffect(()=> {

    onUpdate?.(id, { image });
  }, [image]);

  return (
    <div
      ref={setNodeRef}
      style={{transform: `translate(${x}px, ${y}px)`, position: 'absolute', background: '#96BBD4', padding: '1rem', borderRadius: '8px', boxShadow: '0 2px 6px rgba(0,0,0,0.2)', minWidth: '320px'}}>

      <img
        src={closeIcon}
        alt="delete"
        onClick={(e)=> {

          e.stopPropagation();
          onDelete(id);
        }}
        style={{position: 'absolute', top: '-10px', right: '-10px', width: '24px', height: '24px', cursor: 'pointer', zIndex: 10 }}/>


      <div {...listeners} {...attributes} style={{ cursor: 'grab', marginBottom: '8px' }}>
        <h3 style={{ textAlign: 'center', margin: 0 }}>Pipeline</h3>
      </div>

      <div
        id={topDotId}
        onClick={()=> onDotClick(topDotId)}
        style={{ width: '12px',height: '12px', backgroundColor: 'red', borderRadius: '50%', position: 'absolute', cursor: 'pointer', top: '-6px',left: '50%', transform: 'translateX(-50%)', border: isTopActive ? '2px solid black' : 'none'}}/>
      <div
        id={dotId}
        onClick={()=> onDotClick(dotId)}
        style={{width: '12px',height: '12px', backgroundColor: 'red', borderRadius: '50%',  position: 'absolute', cursor: 'pointer', right: '-6px', top: '33px', transform: 'translateY(-50%)', border: isActive ? '2px solid black' : 'none'}}/>
      <div
        id={bottomDotId}
        onClick={()=> onDotClick(bottomDotId)}
        style={{width: '12px', height: '12px', backgroundColor: 'red', borderRadius: '50%', position: 'absolute', cursor: 'pointer', bottom: '-6px', left: '50%', transform: 'translateX(-50%)', border: isBottomActive ? '2px solid black' : 'none'}}/>


      {image=== null && (
        <div
          onClick={()=> setImage('')}
          style={{display: 'flex', alignItems: 'center', cursor: 'pointer', marginTop: '1rem',  marginBottom: '10px'}}>
          <img
            src={addIcon}
            alt="add"
            style={{ width: '20px', height: '20px', marginRight: '8px' }}/>
          <span><strong>Add Image</strong></span>
        </div>
      )}


      {image !==null && (
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
          <label style={{ width: '60px' }}>Image</label>
          <input
            value={image}
            onChange={(e)=> setImage(e.target.value)}
            placeholder="e.g., node:16-alpine"
            style={{flex: 1, padding: '6px', border: '1px solid #ccc', background: '#e6f2ff'}}/>
          <img
            src={closeIcon}
            alt="delete"
            onClick={()=> setImage(null)}
            style={{marginLeft: '8px', width: '20px', height: '20px', cursor: 'pointer' }}/>
        </div>
      )}


    </div>
  );


}
