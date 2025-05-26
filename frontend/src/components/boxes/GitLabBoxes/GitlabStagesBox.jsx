import React, { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import closeIcon from '../../../assets/close-ellipse-svgrepo-com.svg';
import addIcon from '../../../assets/add-ellipse-svgrepo-com.svg';

export default function GitlabStagesBox({id, position, onDelete, onDotClick, gStages = [], activeConnector, isDotConnected,onUpdate}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });
  const [gStagesState, setGStages] = useState(gStages);

  const x = transform ? position.x + transform.x : position.x;
  const y = transform ? position.y + transform.y : position.y;

  const wrapperStyle = {transform: `translate(${x}px, ${y}px)`, position: 'absolute', background: '#A5CCDE', padding: '1rem', borderRadius: '8px', boxShadow: '0 2px 6px rgba(0,0,0,0.2)', minWidth: '320px',};

  const leftDotId = `gstage-box-${id}-in`;
  const isLeftActive = activeConnector === leftDotId || isDotConnected(leftDotId);

  const handleAddGStage = ()=> {

    const updated = [...gStages, { label: '' }];
    setGStages(updated);
    onUpdate(id, { gStages: updated });

  };
  

  const handleGStageChange = (index, value)=> {

    const updated = gStages.map((s, i)=> (i === index ? { ...s, label: value } : s));
    setGStages(updated);
    onUpdate(id, { gStages: updated }); 

  };
  

  const handleDeleteGStage= (index)=> {

    setGStages(prev => prev.filter((_, i)=> i !== index));

  };

  return (
    <div ref={setNodeRef} style={wrapperStyle}>

      <img
        src={closeIcon}
        alt="delete"
        onClick={()=> onDelete(id)}
        style={{ position: 'absolute',top: '-10px', right: '-10px', width: '24px', height: '24px', cursor: 'pointer'}}/>

      <div {...listeners} {...attributes} style={{ cursor: 'grab', marginBottom: '8px' }}>
        <h3 style={{ textAlign: 'center', margin: 0 }}>GitLab Stages</h3>
      </div>

      <div
        id={leftDotId}
        onClick={()=> onDotClick(leftDotId)}
        style={{ width: '12px',  height: '12px', backgroundColor: 'red', border: isLeftActive ? '2px solid black' : 'none', borderRadius: '50%', position: 'absolute',left: '-10px',top: '50%',transform: 'translateY(-50%)', cursor: 'pointer'}}/>

      <div
        onClick={handleAddGStage}
        style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', marginBottom: '10px' }}
      >
        <img src={addIcon} alt="add" style={{ width: '20px', height: '20px', marginRight: '8px' }} />
        <span><strong>Add Stage</strong></span>
      </div>

      {gStages.map((stage, index)=> {
        const dotId = `gstage-box-${id}-stage-${index}`;

        const isActive = activeConnector === dotId || isDotConnected(dotId);

        return (
          <div
            key={index}
            style={{display: 'flex',alignItems: 'center', marginBottom: '6px', position: 'relative'}}>
            <input
              type="text"
              value={stage.label}
              onChange={(e)=> handleGStageChange(index, e.target.value)}
              placeholder="e.g., build"
              style={{ flex: 1,padding: '6px',border: '1px solid #ccc', background: '#F2FBFF'}}/>

            <img
              src={closeIcon}
              alt="delete gstage"
              onClick={()=> handleDeleteGStage(index)}
              style={{ width: '18px', height: '18px', marginLeft: '8px', cursor: 'pointer' }}
            />
            <div
              id={dotId}
              onClick={()=> onDotClick(dotId)}
              style={{width: '12px', height: '12px', backgroundColor: 'red', borderRadius: '50%', position: 'absolute',right: '-23px', top: '50%', transform: 'translateY(-50%)',  cursor: 'pointer', border: isActive ? '2px solid black' : 'none'}}/>
          </div>
        );
      })}
    </div>
  );

}
