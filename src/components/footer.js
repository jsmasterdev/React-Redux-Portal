import React from 'react';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
  footer: {
    position: 'fixed',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
    backgroundColor: theme.palette.primary.dark,
    padding: theme.spacing(2),
    '& .content': {
      textAlign: 'center',
    },
    '& h6': {
      color: theme.palette.textOnPrimary,
    },
  },
  link: {
    color: '#fff',
    textDecoration: 'none'
  },
  spacer: {
    display: 'inline',
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
});

const Footer = ({ classes }) => (
  <footer className={classes.footer}>
    <Typography variant="subtitle2" align="center" gutterBottom>
      {"All rights reserved. Captain's Club " + (new Date().getFullYear())}
    </Typography>
  </footer>
);

export default withStyles(styles)(Footer);
