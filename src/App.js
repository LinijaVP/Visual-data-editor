import React, {useState, useEffect, useMemo, useRef} from 'react'
import { Card, CardContent, CardHeader, Typography, IconButton, Collapse, Divider, Input, Box, Autocomplete, TextField, Button} from '@mui/material';
import { OpenWith, ExpandMore, ExpandLess, Add } from "@mui/icons-material";
//import Add from "@mui/icons-material/Add";
import { lightGreen } from '@mui/material/colors';
import { styled } from '@mui/material/styles';
import Draggable from 'react-draggable';
import { Space, NoPanArea } from 'react-zoomable-ui';
import { ContextMenu } from 'primereact/contextmenu';
import 'primereact/resources/themes/saga-blue/theme.css';
import { debounce } from 'lodash';

const maxWidthCards = 300;
//const maxHeightCards = 300;

// Save button
const SaveButton = ({onSave}) => {
  return (
    <Button variant="contained" color="primary" style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 3}} onClick={onSave}>
    Save as
    </Button>
  );
};

// Cards
function CardNode(data) {
  const label = data.label
  const active = data.active
  const isActive = data.isActive
  const xPos = (maxWidthCards+15) * data.index + data.offset
  //const yPos = maxHeightCards * index
  var inputRef = ''
  const autocompleteData = data.all_gear_names.filter( gearName => active.includes(gearName) === false)

  const handleButtonClick = () => {
    var error = ""
    var itemName = inputRef.value
    if(itemName === ""){
      error += "Missing item name\n"
    }
    else if(data.all_gear_names.includes(itemName) === false){
      error += "Item not in all gear\n"
    }
    if(active.includes(itemName)){
      error += "Item already included\n"
    }

    if(error === ''){
      data.handleAddItem(itemName, data.parentDict, label)
    } else {
      alert(error)
    }
    inputRef.value = ''
  };

  const onRightClick = (event, id) => {
    data.contextRef.current.show(event)
    data.contextSetDeleteParameters(id,data.parentDict,label)
  };

  

  return (
    <div id={label} key={label} style={{zIndex:1}}>
      <Draggable handle=".handle" nodeRef={data.dragRef} defaultPosition={{x: xPos, y: 150}}>
      <Card sx={{ maxWidth: maxWidthCards, bgcolor: lightGreen[600], position:'absolute'}}>
        <CardHeader
          action={
            <div>
              <StyledIconButton size="small" onClick={() => data.toggleCard(label)}>
                {isActive ? <ExpandLess /> : <ExpandMore />}
              </StyledIconButton>
              <StyledIconButton size="small" className="handle" ref={data.dragRef} style={{cursor:'grab'}}>
                <OpenWith />
              </StyledIconButton>
            </div>
          }
          titleTypographyProps={{variant:"h1",color: 'white',fontSize: '1.5rem', marginRight:'10px'}}
          title={label}
        >
        </CardHeader>
        <Divider/>
        <Collapse in={isActive} timeout="auto" unmountOnExit>


          <CardContent sx={{bgcolor: lightGreen[500],padding: '8px'}}>
            <Typography variant="body1" component={'span'} gutterBottom={false} sx={{ color: 'white', fontSize: '1.2rem', fontWeight: '400'}}>
              {active.map((activity,index) =>(
                <div key={index}>
                  <div onContextMenu={(event) => onRightClick(event, index)}>
                    {activity}
                  </div>
                  <Divider sx={{ margin:0.5 }}/>
                </div>
              ))}

              <div>
                <StyledIconButton size="small" sx={{marginTop:'5px', marginRight:'10px'}} onClick={handleButtonClick}>
                  <Add />
                </StyledIconButton>
                <Autocomplete id={label} freeSolo options={autocompleteData} 
                  renderInput={(params) => 
                    <TextField {...params} variant="standard" sx={{input:{color:'white'}}} value={inputRef.value} inputRef={(input) => (inputRef = input)}/>
                  }
                />
              </div>
            </Typography>
          </CardContent>


        </Collapse>
      </Card>
      </Draggable>
    </div>
  );
};


function CardParents(data){
  const label = data.label;
  const isActive = data.isActive;
  const offSetLocal = Math.floor(data.cardsNumber/2)* maxWidthCards
  var dictDraw = false
  var inputRef = ''
  var inputrefnum = ''
  var writeDict = <div></div>;


  function dictionaryDraw (){

    const handleButtonClick = () => {
      var error = ""
      var itemName = inputRef.value
      var itemPrice = inputrefnum.value
      if(itemName === ''){
        error += "Missing item name\n"
      }
      if(Object.keys(data.dict).includes(itemName)){
        error += "Item is already included\n"
      }
      if(label === "rewards"){
        if(data.all_activity_names.includes(itemName) ===false){
          error += "Activity doesn't exist\n"
        }
      }
      if(itemPrice === ''){
        error += "Missing item price\n"
      } 
      else if(/^\d*$/.test(itemPrice) === false){ // Price is only numbers
        error += "Price needs to include numbers only"
      }


      if(error === ''){
        itemName = itemName[0].toUpperCase() + itemName.slice(1)
        data.handleAddItemDict(itemName, parseInt(itemPrice), data.parentDict)
        inputRef.value = ''
        inputrefnum.value = ''
      } else {
        alert(error)
      }
    };
  
    const onRightClick = (event, id) => {
      data.contextRef.current.show(event)
      data.contextSetDeleteParametersDict(id,data.parentDict)
    };

    return (
      <div id={label} key={label}>
      <Divider/>
      <Collapse in={isActive} timeout="auto" unmountOnExit>
        <CardContent sx={{bgcolor: lightGreen[500],padding: '8px'}}>
          <Typography variant="body1" component={'span'} gutterBottom={false} sx={{ color: 'white', fontSize: '1.2rem', fontWeight: '400'}}>
            {Object.keys(data.dict).map(key => (
              <div key={key}>
                <div onContextMenu={(event) => onRightClick(event, key)}>
                  {key} : <b>{data.dict[key]}</b>
                </div>
                <Divider sx={{ margin:0.5 }}/>
              </div>
            ))}
            <div>
              <StyledIconButton size="small" sx={{marginTop:'5px', marginRight:'10px'}} onClick={handleButtonClick}>
                <Add />
              </StyledIconButton>
              <Box display="flex" gap={2} alignItems="center">
              <Input label="Outlined" variant="outlined" sx={{color:'white', flex:1}} inputRef={(input) => (inputRef = input)}/> : 
              <Input label="Outlined" variant="outlined" sx={{color:'white', width:'50px'}} inputRef={(input) => (inputrefnum = input)}/>
              </Box>
            </div>
          </Typography>
        </CardContent>
      </Collapse> 
      </div>
    )
  } 

  if (label === "all gear" || label === "rewards"){
    dictDraw = true
    writeDict = dictionaryDraw()
  }

  return(
    <div id={label} key={label} style={{zIndex:1}}>
    <Draggable handle=".handle" nodeRef={data.dragRef} defaultPosition={{x: data.offset + offSetLocal, y: 0}}>
      <Card sx={{ maxWidth: maxWidthCards, bgcolor: lightGreen[600], position:'absolute'}}>
        <CardHeader
          action={
            <div>
              <StyledIconButton size="small" onClick={() => data.toggleCard(label)}>
                {isActive ? <ExpandLess /> : <ExpandMore />}
              </StyledIconButton>
              <StyledIconButton size="small" className="handle" ref={data.dragRef} style={{cursor:'grab'}}>
                <OpenWith />
              </StyledIconButton>
            </div>
          }
          titleTypographyProps={{variant:"h1",color: 'white',fontSize: '1.5rem', marginRight:'10px'}}
          title={label}
        >
        </CardHeader>
        {dictDraw ? writeDict : <div></div>}
      </Card>
    </Draggable>
    </div>
  );
}







function App() {

  const [data,setData] = useState() // Data store
  const [loading, setLoading] = useState(true); // Set loading
  const [openCards, setOpenCards] = useState([]); // Array to store open card IDs
  const dragRef = useRef(null)
  const contextRef = useRef(null)
  const contextItems = [{label: 'Remove', command: () => handleRemoveItem()}]
  const [contextHandle, setContextHandle] = useState()

  // Load JSON file
  useEffect (() => {
    fetch("/load_json").then(
      res => res.json()
    ).then(
      data => {
        setData(data)
        setLoading(false)
      }
    )
  },[])

  // Save as function for the data
  const handleSave = async () => {
    try {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'data.json'

      document.body.appendChild(a)
      a.click()

      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  // Helper functions 
  /// Toogle Card expand
  const toggleCard = (id) => {
    setOpenCards((prev) =>
      prev.includes(id) ? prev.filter((cardId) => cardId !== id) : [...prev, id]
    );
  };

  const contextSetDeleteParameters = (id, parent,label) => {
    setContextHandle({id: id, parent:parent, label:label})
  };

  const contextSetDeleteParametersDict = (id, parent) => {
    setContextHandle({id: id, parent:parent, label:''})
  };

  // Handle button click to update the data, Add item to string array
  const handleAddItem = (textInput, parent, label) => {
    setData(data => ({
      ...data, 
      [parent]: {
        ...data[parent], 
        [label]: [
          ...data[parent][label], textInput
        ]
      } 
    }))
  };

  // Handle button click to update the data, Add item to dict
  const handleAddItemDict = (itemName,itemPrice, parentName) => {
    setData(data => ({
      ...data, 
      [parentName]: {
        ...data[parentName], [itemName]:itemPrice
      } 
    }))
  };

  // Handle button click to update the data, Remove input
  const handleRemoveItem = debounce(() => { //debounce to prevent double deletion with a 100 ms delay, using contextHandle 
    if(contextHandle.label === ''){
      handleRemoveItemDict()
      return;
    }

    setData(data => ({
      ...data, 
      [contextHandle.parent]: {
        ...data[contextHandle.parent], 
        [contextHandle.label]: [...data[contextHandle.parent][contextHandle.label]].filter((_,index) => index !== contextHandle.id)      
      }
    }))
  },100);

  const handleRemoveItemDict = () => { 
    if(contextHandle.parent === 'all_gear'){
      checkAndDelete()
    }
    setData(data => {
      const newDict = data[contextHandle.parent];
      delete newDict[contextHandle.id];
      return{
        ...data, 
          [contextHandle.parent]: newDict    
      };
    })
  };

  const checkAndDelete = () => { // Upon deleting gear delete it from all activities 
    ["activities_gear_dictionary", "substitutes"].map(name =>{
      Object.keys(data[name]).map(childName => {
        setData(data => ({
          ...data, 
          [name]: {
            ...data[name], 
            [childName]: [...data[name][childName]].filter(keys => keys !== contextHandle.id)      
          }
        }))
      })
    })
  };
  

  // useMemo to write cards data. useMemo is run only when the dependant data changes
  const allCards = useMemo(() => { 
    if(data === undefined) return []
    
    const allData = Object.entries(data)
    const all_gear_names = Object.keys(data.all_gear).concat(Object.keys(data.substitutes))
    const all_activity_names = Object.keys(data.activities_gear_dictionary)

    var offset = 0
    var cardsNumber = 0;

    return allData.map((object, index) => {
      offset += cardsNumber * (maxWidthCards+15) 
      const parentName = object[0]
      
      if(parentName === "activities_gear_dictionary" || parentName === 'substitutes'){
        cardsNumber = Object.keys(object[1]).length
        const label = parentName.replace(/_/g, ' ')
        const drawChildren = openCards.includes(label)
        return (
          <div>
          {CardParents({label:label, dragRef, offset: offset, isActive:drawChildren, cardsNumber, toggleCard})}
          {Object.entries(object[1]).map(([name,value], indexChild) => (
              <div key={indexChild}>
                {CardNode({ label: name, active: value, isActive : openCards.includes(name), parentDict: parentName, index: indexChild, offset:offset, dragRef, contextRef, all_gear_names, toggleCard, contextSetDeleteParameters, handleAddItem})}
                
              </div>
            ))
          }
          </div>

        ) 
      } 
      else if (parentName === "all_gear" || parentName === "rewards") {
        cardsNumber = 1;
        const name = parentName.replace(/_/g, ' ')

        return (
        <div>
          {CardParents({label:name, offset: offset, isActive:openCards.includes(name), parentDict: parentName, cardsNumber, dict:object[1], dragRef, contextRef, all_activity_names, toggleCard, handleAddItemDict, contextSetDeleteParametersDict})}
        </div>
        )
      }
      
      
      return (
        <div></div>
      )
    });


    /*return activities.map(([name,activity], index) => (
      CardNode({ label: name, active: activity, isActive : openCards.includes(name), toggleCard, dragRef, index, contextSetDeleteParameters, parentDict, contextRef, handleAddItem})
    ));*/
  },[data, openCards]); 

  

  // Ensure `data` exists and then make arrays
  // While loading, display a loading message
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
    <Space>
    <NoPanArea>
    <Draggable handle=".bHandle" nodeRef={dragRef}>
        <div>
          <div className="bHandle" ref={dragRef} style={{position: 'absolute', cursor: 'grab', zIndex: 0, width:'100%', height:'100%'}}></div>
          <ContextMenu model={contextItems} ref={contextRef} breakpoint="767px"/>
          {allCards}
        </div>
    </Draggable>
    </NoPanArea>
    </Space>
    <SaveButton onSave={handleSave}/>
    </div>
  )
}


// Helpers and styles
const StyledIconButton = styled(IconButton)(() => ({
  backgroundColor: "#fff",
  boxShadow: "0 1px 4px 0 rgba(0,0,0,0.12)",
  color: "rgba(0, 0, 0, 0.54)",
  "&:hover": {
    backgroundColor: "#fff",
    color: "#000",
  },
}));

export default App