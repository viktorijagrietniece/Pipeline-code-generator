import React, { useState, useEffect, useRef } from 'react';
import { useDraggable } from '@dnd-kit/core';
import closeIcon from '../../../assets/close-ellipse-svgrepo-com.svg';
import addIcon from '../../../assets/add-ellipse-svgrepo-com.svg';

export default function GitlabBeforeAfterBox({id,position,scripts = {},onDelete, onDotClick, activeConnector, isDotConnected, onUpdate,}) {
  const {attributes, listeners, setNodeRef, transform} = useDraggable({id});

  const [scriptBlocks, setScriptBlocks] = useState(()=> scripts || {});
  const [selectedType, setSelectedType] = useState(()=> {
  const keys = Object.keys(scripts);
  return keys.length ===1 ? keys[0] : null;
});

  const [showDropdown, setShowDropdown] = useState(false);

  const dropdownRef = useRef(null);

  const x = transform ? position.x + transform.x : position.x;
  const y = transform ? position.y + transform.y : position.y;

  // const leftDotId = `before-after-box-${id}-in`;
  // const rightDotId = `before-after-box-${id}-out`;
  const topDotId = `before-after-box-${id}-top`;
const bottomDotId = `before-after-box-${id}-bottom`;
const isTopActive = activeConnector === topDotId || isDotConnected(topDotId);
const isBottomActive = activeConnector === bottomDotId || isDotConnected(bottomDotId);

  useEffect(()=> {

    onUpdate?.(id, { scripts: scriptBlocks });
  }, [scriptBlocks]);


  useEffect(() => {

    const handleClickOutside = (e)=> {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return ()=> document.removeEventListener('mousedown', handleClickOutside);
  }, 
  []);

  const handleDropdownSelect = (type)=> {

  setSelectedType(type);                      
  setScriptBlocks({ [type]: ['']  });          
  setShowDropdown(false);               

};


  const handleAddLine = ()=> {

    if (!selectedType) {
      setShowDropdown(true);
      return;
    }
    if (showDropdown) return;

    setScriptBlocks((prev)=> ({
      ...prev,
      [selectedType]: [...(prev[selectedType] || []), '']
    }));

  };

  const handleScriptChange = (type,index, value)=> {

    setScriptBlocks((prev)=> ({
      ...prev,
      [type]: prev[type].map((line, i)=> (i === index ? value : line)),
    }));

  };

  const handleDeleteLine = (type, index)=> {

    setScriptBlocks((prev)=> ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
    }));

  };

  return (
    <div
      ref={setNodeRef}
      style={{transform: `translate(${x}px, ${y}px)`,position: 'absolute', background: '#DBEBF2',padding: '1rem', borderRadius: '8px',boxShadow: '0 2px 6px rgba(0,0,0,0.2)', minWidth: '320px'}}>
      <img
        src={closeIcon}
        alt="delete"
        onClick={() => onDelete(id)}
        style={{ position: 'absolute', top: '-10px',right: '-10px', width: '24px', height: '24px', cursor: 'pointer', zIndex: 10}}/>
      <div {...listeners} {...attributes} style={{ cursor: 'grab', marginBottom: '8px' }}>
        <h3 style={{ textAlign: 'center', margin: 0 }}>Before/After Scripts</h3>
      </div>
      <div
        onClick={handleAddLine}
        style={{ display: 'flex',alignItems: 'center', cursor: 'pointer', marginBottom: '10px'   }}>
        <img src={addIcon} alt="add" style={{ width: '20px', height: '20px', marginRight: '8px' }} />
        <strong>
          {selectedType ? `Add ${selectedType.replace('_', ' ')}` : 'Add Script'}
        </strong>
      </div>
      {showDropdown && (
        <div
          ref={dropdownRef}
          style={{position: 'relative',marginBottom: '10px'}}>
          <div
            style={{
              position: 'absolute',background: '#F2FBFF', border: '1px solid #ccc', borderRadius: '6px', width: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', zIndex: 10}}>
            {['before_script', 'after_script'].map((type)=> (
              <div
                key={type}
                onClick={()=> handleDropdownSelect(type)}
                style={{padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #eee', fontWeight: '500', transition: 'background 0.2s'}}
                onMouseEnter={(e)=> (e.currentTarget.style.backgroundColor = '#f3f4f6')}
                onMouseLeave={(e)=> (e.currentTarget.style.backgroundColor = '#fff')}>
                {type.replace('_', ' ')}
              </div>
            ))}
          </div>
        </div>
      )}

      {Object.entries(scriptBlocks).map(([type, lines])=> (
        <div key={type} style={{ marginBottom: '1rem' }}>
          <strong style={{ textTransform: 'capitalize' }}>{type.replace('_', ' ')}</strong>
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
{selectedType === 'after_script' && (
  <div
    id={topDotId}
    onClick={()=> onDotClick(topDotId)}
    style={{width: '12px', height: '12px', backgroundColor: 'red', borderRadius: '50%', position: 'absolute',top: '-10px',left: '50%',transform: 'translateX(-50%)', border: isTopActive ? '2px solid black' : 'none', cursor: 'pointer'}}/>
)}


{selectedType === 'before_script' && (
  <div
    id={bottomDotId}
    onClick={()=> onDotClick(bottomDotId)}
    style={{ width: '12px', height: '12px', backgroundColor: 'red', borderRadius: '50%', position: 'absolute', bottom: '-10px',left: '50%', transform: 'translateX(-50%)', border: isBottomActive ? '2px solid black' : 'none', cursor: 'pointer'}}/>
)}

    </div>
  );

  
}
