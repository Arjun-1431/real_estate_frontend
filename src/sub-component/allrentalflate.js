import * as React from 'react';
import Box from '@mui/material/Box';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import AddBusinessIcon from '@mui/icons-material/AddBusiness';
import ApartmentIcon from '@mui/icons-material/Apartment';
import AllFlatsList from './alluseruplodedflate';
import UserListedFlats from './allflatesuseruploded';

export default function AllrentalFlate() {
  const [value, setValue] = React.useState(0);
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;
  const normalizedRole = typeof user?.role === 'string' ? user.role.toLowerCase() : '';
  const canViewOwnFlats = normalizedRole === 'user';
  const tabs = [
    {
      label: 'All Flats',
      icon: <ApartmentIcon />,
      component: <AllFlatsList />,
    },
  ];

  if (canViewOwnFlats) {
    tabs.push({
      label: 'Your Listed Flats',
      icon: <AddBusinessIcon />,
      component: <UserListedFlats />,
    });
  }

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box
      sx={{
        width: '100%',
        px: { xs: 2, sm: 3, md: 4 },
        pt: { xs: 12, sm: 13, md: 14 },
        pb: { xs: 3, sm: 4 },
      }}
    >
      <Box
        sx={{
          maxWidth: '1100px',
          mx: 'auto',
          mb: { xs: 3, sm: 4 },
        }}
      >
        <BottomNavigation
          showLabels
          value={value}
          onChange={handleChange}
          sx={{
            width: '100%',
            height: 'auto',
            minHeight: 72,
            borderRadius: 4,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'rgba(255,255,255,0.95)',
            overflowX: 'auto',
            justifyContent: { xs: 'flex-start', sm: 'center' },
            px: 1,
          }}
        >
          {tabs.map((tab, index) => (
            <BottomNavigationAction
              key={index}
              label={tab.label}
              icon={tab.icon}
              sx={{
                minWidth: { xs: 140, sm: 180 },
                py: 1.5,
              }}
            />
          ))}
        </BottomNavigation>
      </Box>
      {tabs[value]?.component}
    </Box>
  );
}
