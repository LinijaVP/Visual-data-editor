import React, {useState, useEffect, useMemo, useRef} from 'react'
import { Card, CardContent, CardHeader, Typography, IconButton, Collapse, Divider } from '@mui/material';
import { OpenWith, ExpandMore, ExpandLess } from "@mui/icons-material";
//import Add from "@mui/icons-material/Add";
import { lightGreen } from '@mui/material/colors';
import { styled } from '@mui/material/styles';
import Draggable from 'react-draggable';
import { Space, NoPanArea } from 'react-zoomable-ui';

const maxWidthCards = 300;
//var x=0; var y=0;

// Cards
function CardNode(data) {
  const label = data.label
  const active = data.active
  const isActive = data.isActive

  return (
    <div key={label} style={{zIndex:1}}>
      <Draggable handle=".handle" nodeRef={data.dragRef}>
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
          titleTypographyProps={{variant:"h1",color: 'white',fontSize: '1.5rem'}}
          title={label}
        >
        </CardHeader>
        <Divider/>
        <Collapse in={isActive} timeout="auto" unmountOnExit>
          {CardArray(active)}
        </Collapse>
      </Card>
      </Draggable>
    </div>
  );
};

function CardArray(activities) {
  return (
    <CardContent sx={{bgcolor: lightGreen[500],padding: '8px'}}>
      <Typography variant="body1" component={'span'} gutterBottom={false} sx={{ color: 'white', fontSize: '1.2rem', fontWeight: '400'}}>
        {activities.map((activity,index) =>(
          <div key={index}>
            {activity}
            <Divider sx={{ margin:0.5 }}/>
          </div>
        ))}
      </Typography>
    </CardContent>
  );
}

function App() {

  const [data,setData] = useState() // Data store
  const [loading, setLoading] = useState(true); // Set loading
  const [openCards, setOpenCards] = useState([]); // Array to store open card IDs
  const dragRef = useRef(null)
  

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

  //<IconButton aria-label="move" className="handle"> <Draggable handle=".handle">

  // Helper functions 
  /// Toogle Card expand
  const toggleCard = (id) => {
    setOpenCards((prev) =>
      prev.includes(id) ? prev.filter((cardId) => cardId !== id) : [...prev, id]
    );
  };
  

  // Transform data into nodes for flow and use useMemo which only recreates nodes if activities changes
  const allCards = useMemo(() => { 
    if(data === undefined) return []
    
    // Get activities dictionary
    const activities = Object.entries(data.activities_gear_dictionary);
  
    return activities.map(([name,activity]) => (
      CardNode({ label: name, active: activity, isActive : openCards.includes(name), toggleCard, dragRef })
    ));
  },[data, openCards]); 

  

  // Ensure `data` exists and then make arrays
  // While loading, display a loading message
  if (loading) return <div>Loading...</div>;
  
  return (
    <Space>
    <NoPanArea>
    <Draggable handle=".bHandle">
        <div style={{ width: '100vw', height: '100vh' }}>
          <div className="bHandle" style={{position: 'absolute', cursor: 'grab', zIndex: 0, top: 0, left: 0, right: 0, bottom: 0}}></div>
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