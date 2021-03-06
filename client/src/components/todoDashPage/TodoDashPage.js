import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Loader from '../loader/Loader';
import EmptyPage from '../emptypage/EmptyPage';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Checkbox from '@material-ui/core/Checkbox';
import CustomSnackbar from '../snackbar/CustomSnackbar';
import withStyles from '@material-ui/core/styles/withStyles';
import axios from 'axios';
import * as ROUTES from '../../constants/routes';
import styles from './styles';

class TodoPage extends Component {
  state = {
    todos: [],
    gettingTodos: true,
    checked: [],
    openSnackbar: false,
    snackbarMessage: '',
    snackbarVariant: '',
  };

  componentDidMount() {
    axios.get('/api/users/todos').then(response => {
      this.setState({ todos: response.data, gettingTodos: false });
    });
  }

  handleCheckToggle = id => () => {
    const { checked } = this.state;
    const currentID = checked.indexOf(id);
    const newChecked = [...checked];

    if (currentID === -1) {
      newChecked.push(id);
    } else {
      newChecked.splice(currentID, 1);
    }

    this.setState({
      checked: newChecked,
    });
  };

  deleteTodos = event => {
    event.preventDefault();

    const { checked } = this.state;

    if (checked.length < 1) {
      return;
    }

    const todos = this.state.todos.filter(
      todo => checked.indexOf(todo.id) === -1
    );

    axios
      .delete('/api/todos', { data: { checked } })
      .then(response => {
        this.setState({
          todos,
          checked: [],
          snackbarMessage: 'Successfully deleted todos!',
          snackbarVariant: 'success',
          openSnackbar: true,
        });
      })
      .catch(err => {
        console.log(err);
        this.setState({
          checked: [],
          snackbarMessage: 'Error deleting todos!',
          snackbarVariant: 'error',
          openSnackbar: true,
        });
      });
  };

  snackbarClose = () => {
    this.setState({
      openSnackbar: false,
    });
  };

  render() {
    const { classes, loading } = this.props;
    const {
      todos,
      gettingTodos,
      checked,
      snackbarMessage,
      snackbarVariant,
      openSnackbar,
    } = this.state;
    const disabled = checked.length > 0 ? false : true;

    if (loading || gettingTodos) {
      return <Loader className={classes.loading} size={80} />;
    }

    return (
      <main className={classes.main}>
        <Grid container spacing={0} justify="center">
          <Grid className={classes.gridItem} item xs={12} sm={6} md={4}>
            <div className={classes.todoBar}>
              <Button
                component={Link}
                to={ROUTES.TODO_ADD}
                variant="contained"
                color="primary"
              >
                Add Todo
              </Button>
              <Button
                variant="contained"
                onClick={this.deleteTodos}
                color="primary"
                disabled={disabled}
              >
                Delete
              </Button>
            </div>
          </Grid>
        </Grid>
        <Grid container spacing={0} justify="center">
          <Grid className={classes.gridItem} item xs={12} sm={6} md={4}>
            {todos.length < 1 ? (
              <EmptyPage
                className={classes.emptyPage}
                variant="h3"
                message="Please add a todo."
                color="textSecondary"
              />
            ) : (
              <List className={classes.list}>
                {todos.map((todo, index) => (
                  <ListItem
                    key={index}
                    button
                    onClick={this.handleCheckToggle(todo.id)}
                  >
                    <Checkbox
                      checked={checked.indexOf(todo.id) !== -1}
                      tabIndex={-1}
                      color="primary"
                    />
                    <ListItemText primary={todo.title} />
                    <ListItemSecondaryAction>
                      <Button
                        component={Link}
                        to={{
                          pathname: `/todo/${todo.id}`,
                          state: { ...todo },
                        }}
                        color="primary"
                      >
                        View
                      </Button>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            )}
          </Grid>
        </Grid>
        <CustomSnackbar
          open={openSnackbar}
          variant={snackbarVariant}
          message={snackbarMessage}
          onClose={this.snackbarClose}
          onClick={this.snackbarClose}
        />
      </main>
    );
  }
}

TodoPage.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(TodoPage);
