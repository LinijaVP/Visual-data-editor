import React, {useState, useEffect, useMemo, useRef} from 'react'
import { Card, CardContent, CardHeader, Typography, IconButton, Collapse, Divider, Input } from '@mui/material';
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

// Cards
function CardNode(data) {
  const label = data.label
  const active = data.active
  const isActive = data.isActive
  const xPos = (maxWidthCards+15) * data.index + data.offset
  //const yPos = maxHeightCards * index
  var inputRef = ''

  const handleButtonClick = () => {
    if(inputRef.value !== ''){
      data.handleAddItem(inputRef.value, data.parentDict, label)
      inputRef.value = ''
    }
  };

  const onRightClick = (event, id) => {
    data.contextRef.current.show(event)
    data.contextSetDeleteParameters(id,data.parentDict,label)
  };

  

  return (
    <div key={label} style={{zIndex:1}}>
      <Draggable handle=".handle" nodeRef={data.dragRef} defaultPosition={{x: xPos, y: 500}}>
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
                <Input label="Outlined" variant="outlined" sx={{color:'white'}} inputRef={(input) => (inputRef = input)}/>
              </div>
            </Typography>
          </CardContent>


        </Collapse>
      </Card>
      </Draggable>
    </div>
  );
};

function CardNodeNumbers(data){
  const label = data.label;
  const isActive = data.isActive;
  const offSetLocal = Math.floor(data.cardsNumber/2)* (maxWidthCards+15)
  return(
    <div key={label} style={{zIndex:1}}>
    <Draggable handle=".handle" nodeRef={data.dragRef} defaultPosition={{x: data.offset + offSetLocal, y: 0}}>
      <Card sx={{ maxWidth: maxWidthCards, bgcolor: lightGreen[600], position:'absolute'}}>
        <CardHeader
          action={
            <div>
              <StyledIconButton size="small">
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
      </Card>
    </Draggable>
    </div>
  );
}

function CardParents(data){
  const label = data.label;
  const isActive = data.isActive;
  const offSetLocal = Math.floor(data.cardsNumber/2)* maxWidthCards
  return(
    <div key={label} style={{zIndex:1}}>
    <Draggable handle=".handle" nodeRef={data.dragRef} defaultPosition={{x: data.offset + offSetLocal, y: 0}}>
      <Card sx={{ maxWidth: maxWidthCards, bgcolor: lightGreen[600], position:'absolute'}}>
        <CardHeader
          action={
            <div>
              <StyledIconButton size="small">
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
        //console.log(data)
        setLoading(false)
      }
    )
  },[])

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

  // Handle button click to update the data, Add input
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

  // Handle button click to update the data, Remove input
  const handleRemoveItem = debounce(() => { //debounce to prevent double deletion with a 100 ms delay, using contextHandle 
    setData(data => ({
      ...data, 
      [contextHandle.parent]: {
        ...data[contextHandle.parent], 
        [contextHandle.label]: [...data[contextHandle.parent][contextHandle.label]].filter((_,index) => index !== contextHandle.id)      
      }
    }))
  },100);
  

  // Transform data into nodes for flow and use useMemo which only recreates nodes if activities changes
  const allCards = useMemo(() => { 
    if(data === undefined) return []
    
    const allData = Object.entries(data)

    var offset = 0
    var cardsNumber = 0;
    return allData.map((object, index) => {
      offset += cardsNumber * (maxWidthCards+15) 
      
      if(object[0] === "activities_gear_dictionary" || object[0] === 'substitutes'){
        cardsNumber = Object.keys(object[1]).length
        return (
          <div>
          {CardParents({label:object[0].replace(/_/g, ' '), dragRef, offset: offset, isActive:openCards.includes(object[0]), cardsNumber})}
          {Object.entries(object[1]).map(([name,value], indexChild) => {
              return CardNode({ label: name, active: value, isActive : openCards.includes(name), parentDict: object[0], index: indexChild, offset:offset, dragRef, contextRef, toggleCard, contextSetDeleteParameters, handleAddItem})
            })
          }
          </div>
        )
      }
      
      cardsNumber = 1; 
      return (
        <div>
          {CardNodeNumbers({label:object[0].replace(/_/g, ' '), dragRef, offset: offset, isActive:openCards.includes(object[0]), cardsNumber})}
        </div>
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
    <Space>
    <NoPanArea>
    <Draggable handle=".bHandle">
        <div>
          <div className="bHandle" style={{position: 'absolute', cursor: 'grab', zIndex: 0, width:'100%', height:'100%'}}></div>
          <ContextMenu model={contextItems} ref={contextRef} breakpoint="767px"/>
          {allCards}
        </div>
    </Draggable>
    </NoPanArea>
    </Space>
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