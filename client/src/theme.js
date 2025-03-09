import { createTheme } from '@mui/material';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#dadb00',
      light: '#e4e500',
      dark: '#b1b200',
    },
    secondary: {
      main: '#dadb00',
      light: '#e4e500',
      dark: '#b1b200',
    },
    background: {
      default: '#1c1c1c',
      paper: '#252525',
    },
    text: {
      primary: '#ffffff',
      secondary: '#a0a0a0',
    },
    error: {
      main: '#ff5555',
      light: '#ff7777',
      dark: '#cc4444',
    },
    warning: {
      main: '#dadb00',
      light: '#e4e500',
      dark: '#b1b200',
    },
    success: {
      main: '#00db9d',
      light: '#00ffb7',
      dark: '#00b381',
    }
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
      letterSpacing: '0.02em',
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1c1c1c',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          '@media (max-width: 600px)': {
            paddingLeft: 8,
            paddingRight: 8
          }
        }
      }
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1c1c1c',
          borderRight: '1px solid rgba(255, 255, 255, 0.1)',
          '@media (max-width: 600px)': {
            width: '85%'
          }
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          '@media (max-width: 600px)': {
            minHeight: 48,
            padding: '12px 16px'
          }
        }
      }
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          '@media (max-width: 600px)': {
            padding: 12
          }
        }
      }
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          '@media (max-width: 600px)': {
            paddingTop: 12,
            paddingBottom: 12
          }
        }
      }
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          '@media (max-width: 600px)': {
            margin: 16,
            width: 'calc(100% - 32px)',
            maxHeight: 'calc(100% - 32px)'
          }
        }
      }
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          '@media (max-width: 600px)': {
            padding: '12px 8px'
          }
        }
      }
    }
  },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
          },
          '&:focus': {
            outline: 'none',
          },
          '&:focus-visible': {
            outline: 'none',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          border: 'none',
          '&:focus': {
            outline: 'none',
          },
          '&:focus-visible': {
            outline: 'none',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          padding: '6px 16px',
          transition: 'all 0.2s ease-in-out',
          '&:focus': {
            outline: 'none',
          },
          '&:focus-visible': {
            outline: 'none',
          },
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
          backgroundColor: '#252525',
          fontSize: '0.875rem',
          border: 'none',
        },
        root: {
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          padding: '16px',
          fontSize: '0.875rem',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 8,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.1)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.2)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#dadb00',
            },
          },
        },
      },
    },
    MuiSnackbar: {
      styleOverrides: {
        root: {
          '& .MuiAlert-root': {
            backgroundColor: '#252525',
            color: '#ffffff',
            '&.MuiAlert-standardError': {
              backgroundColor: 'rgba(255, 85, 85, 0.1)',
              color: '#ff5555',
              '& .MuiAlert-icon': {
                color: '#ff5555'
              }
            },
            '&.MuiAlert-standardSuccess': {
              backgroundColor: 'rgba(0, 219, 157, 0.1)',
              color: '#00db9d',
              '& .MuiAlert-icon': {
                color: '#00db9d'
              }
            }
          }
        }
      }
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 6
        }
      }
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          color: 'rgba(255, 255, 255, 0.7)',
          minWidth: 40
        }
      }
    },
    MuiListItemText: {
      styleOverrides: {
        primary: {
          color: '#ffffff'
        }
      }
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            backgroundColor: 'rgba(218, 219, 0, 0.08)',
            '&:hover': {
              backgroundColor: 'rgba(218, 219, 0, 0.12)'
            },
            '& .MuiListItemIcon-root': {
              color: '#dadb00'
            },
            '& .MuiListItemText-primary': {
              color: '#dadb00'
            }
          },
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.05)'
          }
        }
      }
    },
  },
);

export default theme;