import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function Logo() {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/');
  };

  return (
    <Box
      component="img"
      src="/logo.svg"
      alt="Company Logo"
      sx={{
        height: 40,
        width: 'auto',
        display: 'block',
        cursor: 'pointer'
      }}
      onClick={handleClick}
    />
  );
}

export default Logo;