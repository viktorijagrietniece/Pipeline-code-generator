import React, { useState, useEffect, useRef } from 'react';
import { useDraggable } from '@dnd-kit/core';
import closeIcon from '../../../assets/close-ellipse-svgrepo-com.svg';
import addIcon from '../../../assets/add-ellipse-svgrepo-com.svg';

export default function GitlabScriptBox({ id, position, scripts = {},onDelete, onDotClick, activeConnector, isDotConnected, onUpdate}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });

  const [scriptBlocks, setScriptBlocks] = useState(()=> scripts);
  
  const leftDotId = `script-box-${id}-left`;
  const rightDotId = `script-box-${id}-out`;
  const isLeftActive = activeConnector === leftDotId || isDotConnected(leftDotId);
  const isRightActive = activeConnector === rightDotId || isDotConnected(rightDotId);

  const x = transform ? position.x + transform.x : position.x;
  const y = transform ? position.y + transform.y : position.y;

  useEffect(()=> {

    onUpdate?.(id, { scripts: scriptBlocks });
  }, [scriptBlocks]);


  const handleScriptChange = (type, index, value)=> {

    setScriptBlocks((prev)=> ({
      ...prev,
      [type]: prev[type].map((line, i)=> (i === index ? value : line)),
    }));

  };

  const handleAddScriptLine = ()=> {

    setScriptBlocks((prev)=> {
      if (!prev['script']) return { script: [''] };
      return { ...prev, script: [...prev.script, ''] };
    });

  };
  
  const handleAddLine = (type)=> {

    setScriptBlocks((prev)=> ({
      ...prev,
      [type]: [...prev[type], ''],
    }));

  };

  const handleDeleteLine = (type, index)=> {

    setScriptBlocks((prev)=> ({
      ...prev,
      [type]: prev[type].filter((_, i)=> i !== index),
    }));

  };

  return (
    <div
      ref={setNodeRef}
      style={{transform: `translate(${x}px, ${y}px)`, position: 'absolute', background: '#DBEBF2',padding: '1rem', borderRadius: '8px', boxShadow: '0 2px 6px rgba(0,0,0,0.2)', minWidth: '320px'}}>
      <img
        src={closeIcon}
        alt="delete"
        onClick={()=> onDelete(id)}
        style={{position: 'absolute', top: '-10px', right: '-10px',  width: '24px',height: '24px', cursor: 'pointer'}}/>

      <div {...listeners} {...attributes} style={{ cursor: 'grab', marginBottom: '8px' }}>
        <h3 style={{ textAlign: 'center', margin: 0 }}>Script</h3>
      </div>

<div
  onClick={handleAddScriptLine}
  style={{display: 'flex', alignItems: 'center', cursor: 'pointer', marginBottom: '10px'}}>
  <img src={addIcon} alt="add" style={{ width: '20px', height: '20px', marginRight: '8px' }} />
  <strong>Add Script</strong>
</div>


      {Object.entries(scriptBlocks).map(([type, lines])=> (
        <div key={type} style={{ marginBottom: '1rem' }}>
          <strong style={{ textTransform: 'capitalize' }}>{type}</strong>
          {lines.map((line, i)=> (
            <div key={i} style={{ display: 'flex', alignItems: 'center', marginTop: '4px' }}>
              <input
                value={line}
                onChange={(e)=> handleScriptChange(type, i, e.target.value)}
                placeholder='e.g., echo "Hello world"'
                style={{ flex: 1, padding: '6px', border: '1px solid #ccc' }}/>
              <img
                src={closeIcon}
                alt="delete"
                onClick={()=> handleDeleteLine(type, i)}
                style={{ width: '18px', height: '18px', marginLeft: '8px', cursor: 'pointer' }}/>
            </div>
          ))}
        </div>
      ))}

      <div
        id={leftDotId}
        onClick={()=> onDotClick(leftDotId)}
        style={{ width: '12px',height: '12px', backgroundColor: 'red', borderRadius: '50%', position: 'absolute',left: '-10px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer',border: isLeftActive ? '2px solid black' : 'none'}}/>
    </div>
  );


}
