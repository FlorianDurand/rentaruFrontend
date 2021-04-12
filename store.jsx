import { createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunkMiddleware from 'redux-thunk'
import * as GlobalAPI from './utils/api'

const initialState = {
  session: "",
  user: {
    userName: "",
    email: "",
    id: "",
    products : [],
  },
  products : [],
  createdProduct: null
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'saveSession':
      return {
        ...state,
        session: action.payload,
      };
    case 'deleteSession':
      return {
        ...state,
        session: '',
      };
      case 'saveUser':
        return {
          ...state,
          user: action.payload,
        };
      case 'getProducts':
        return {
          ...state,
          products: action.payload,
        };
      case 'createProduct':
        return {
          ...state,
          createdProduct: action.payload,
        };
    default:
      return state;
  }
};

//action creator
const makeAction = (type) => (payload) => {
  return {
    type,
    payload,
  };
};

const setProductsAction = makeAction('getProducts');
const setMeAction = makeAction('saveUser');
const setSessionAction = makeAction('saveSession');
const createProductAction = makeAction('createProduct');


const deleteSessionAction = makeAction('deleteSession');

export const getToken = () => {

}


export const getProducts = () => {
  return (dispatch) => {
    GlobalAPI.getProducts()
      .then((res) => {
        if (res) {
          dispatch(setProductsAction(res));
        } else {
          console.log('error');
          // toast.error(errorMsg('getting workspace data'));
        }
      })
      .catch((e) => {
        console.log('error');
        // toast.error(errorMsg('getting workspace data') + '\nError: ' + e);
      });
  };
};

export const getMe = (token) => {

  return (dispatch) => {
    GlobalAPI.getMe(token)
      .then((res) => {
        if (res) {
          dispatch(setMeAction(res));
        } else {
          console.log('error');
        }
      })
      .catch((e) => {
        console.log('error' +e);
      });
  };
};

export const updateMe = (data, token) => {

  return (dispatch) => {
    GlobalAPI.updateMe(data, token)
      .then((res) => {
        if (res) {
          dispatch(setMeAction(res.data));
        } else {
          console.log('error');
        }
      })
      .catch((e) => {
        console.log('error' +e);
      });
  };
};

export const postConnect = (mail, password) => {

  return (dispatch) => {
    GlobalAPI.postConnect(mail, password)
      .then((data) => {
        if (data) {
          dispatch(setMeAction(data.user));
          dispatch(setSessionAction(data.user.token.token));
        } else {
          console.log('error');
        }
      })
      .catch((e) => {
        console.log('error' +e);
      });
  };
};

export const postProduct = (data, token) => {

  return (dispatch) => {
    GlobalAPI.postProduct(data, token)
      .then((resp) => {
        if (resp) {
          dispatch(createProductAction(resp.data));
        } else {
          console.log('error');
        }
      })
      .catch((e) => {
        console.log('error' +e);
      });
  };
};

export const postSignUp = (
  mail,
  password,
  ville,
  departement,
  prenom,
  nom,
  phone,
  username,
  address,
  selectedFile
  ) => {

  return (dispatch) => {
    GlobalAPI.postSignUp(
      mail,
      password,
      ville,
      departement,
      prenom,
      nom,
      phone,
      username,
      address,
      )
      .then((data) => {
        if (data) {
          const img = new FormData();
          img.append('files', selectedFile);
          img.append('refId', data.user.id);
          img.append('ref', 'user');
          img.append('source', 'users-permissions');
          img.append('field', 'profilPic');
          GlobalAPI.postTokenToUser(data).then(() => {
            dispatch(setMeAction(data.user));
            dispatch(setSessionAction(data.jwt));
          GlobalAPI.postUploadImg(img, data.jwt).then((resp) => {
              if (resp) {
              }  else {
                console.log('error while uploading profil picture');
              }
            })
            .catch((e) => {
              console.log('error while uploading profil picture' +e);
            })
          }).catch((e) => {
            console.log('error while creating token' +e);
          })
          } else {
          console.log('error while creating account ');
        }
      })
      .catch((e) => {
        console.log('error' +e);
      });
  };
};

export const logOut = () => {
  return (dispatch) => {
    dispatch(setMeAction({}));
    dispatch(deleteSessionAction());
  }
}


const store = createStore(reducer, composeWithDevTools(applyMiddleware(thunkMiddleware)));

export default store;
