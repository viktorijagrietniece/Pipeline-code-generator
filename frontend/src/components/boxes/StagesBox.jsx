import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import addIcon from '../../assets/add-ellipse-svgrepo-com.svg';
import closeIcon from '../../assets/close-ellipse-svgrepo-com.svg';

export default function StagesBox({id, position, onDelete, onDotClick, activeConnector,isDotConnected, stages: initialStages  }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({id});

  const x = transform ? position.x + transform.x : position.x;
  const y = transform ? position.y + transform.y : position.y;

  const [stages, setStages] = React.useState(()=> {
    return Array.isArray(initialStages) ? initialStages : [];
  });
  
  

  React.useEffect(()=> {

    if (Array.isArray(initialStages)) {
      setStages(initialStages);
    }
  }, [initialStages]);
  
  
const handleAddStage = ()=> {

  setStages((prev) => [...prev, { id: Date.now(), label: `Stage ${prev.length + 1}` }]);

};

const handleDeleteStage = (index)=> {
  setStages((prev)=> prev.filter((_, i)=> i !== index));
};

  const wrapperStyle = {transform: `translate(${x}px, ${y}px)`, position: 'absolute', background: '#B5ABDB', padding: '1rem', borderRadius: '8px', boxShadow: '0 2px 6px rgba(0,0,0,0.2)', minWidth: '260px'};

  const deleteStyle = {position: 'absolute', top: '-10px',right: '-10px', width: '24px', height: '24px',cursor: 'pointer', zIndex: 10};


  const leftDotId = `stages-box-${id}-in`;
  const rightDotId = `stages-box-${id}-out`;

  const isLeftActive = activeConnector === leftDotId || isDotConnected(leftDotId);
  const isRightActive = activeConnector === rightDotId || isDotConnected(rightDotId);

  return (
    <div ref={setNodeRef} style={wrapperStyle}>

      <img
        src={closeIcon}
        alt="delete"
        onClick={()=> onDelete(id)}
        style={deleteStyle}
      />


      <div {...listeners} {...attributes} style={{ cursor: 'grab', marginBottom: '8px' }}>
        <h3 style={{ textAlign: 'center', margin: 0 }}>Stages</h3>
      </div>

      <div
        id={leftDotId}
        onClick={()=> onDotClick(leftDotId)}
        style={{width: '12px',height: '12px', backgroundColor: 'red', border: isLeftActive ? '2px solid black' : 'none', borderRadius: '50%', position: 'absolute',left: '-10px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer'}}/>

<div
  onClick={handleAddStage}
  style={{display: 'flex',alignItems: 'center', cursor: 'pointer', marginBottom: '10px'}}>
<img
          src={addIcon}
          alt="add"
          style={{width: '20px', height: '20px', marginRight: '8px',cursor: 'pointer'}}/>
        <span><strong>Add Stage</strong></span>
</div>


{stages.map((stage, index)=> {
  const dotId = `stages-box-${id}-stage-${index}`;
  const isActive = activeConnector === dotId || isDotConnected(dotId);

  return (
    <div
      key={`stage-${index}`}
      style={{display: 'flex', alignItems: 'center', marginBottom: '0.5rem', position: 'relative'}}>
      <input
        value={stage.label}
        onChange={(e)=> handleChange(index, e.target.value)}
        style={{flex: 1, padding: '6px', border: '1px solid #ccc',background: '#F6F4FF'}}/>


      <img
        src={closeIcon}
        alt="delete stage"
        onClick={()=> handleDeleteStage(index)}
        style={{ width: '18px', height: '18px', marginLeft: '8px',cursor: 'pointer'}}/>

      <div
        id={dotId}
        onClick={()=> onDotClick(dotId)}
        style={{ width: '12px', height: '12px',backgroundColor: 'red',borderRadius: '50%', position: 'absolute',right: '-23px', top: '50%', transform: 'translateY(-50%)',cursor: 'pointer', border: isActive ? '2px solid black' : 'none'}}/>
    </div>
  );
})
}


    </div>
  );
  
}
