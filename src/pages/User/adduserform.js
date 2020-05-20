import React, {Component} from 'react'
import { Form, Button, Row, Col } from 'react-bootstrap';
import Select from 'react-select';
import { connect } from 'react-redux';
import * as authAction  from '../../actions/authAction';
import SessionManager from '../../components/session_manage';
import API from '../../components/api'
import Axios from 'axios';
import ListErrors from '../../components/listerrors';
import { trls } from '../../components/translate';
import * as Common from '../../components/common';

const mapStateToProps = state => ({ 
    ...state.auth,
});
const mapDispatchToProps = (dispatch) => ({
    postUserError: (params) =>
        dispatch(authAction.dataServerFail(params)),
    removeState: () =>
        dispatch(authAction.blankdispatch()),
});
class Adduserform extends Component {
    _isMounted = false;
    constructor(props) {
        super(props);
        this.state = {  
            roles:[{"value":"Administrator","label":"Administrator"},{"value":"Customer","label":"Customer"}],
            selectrolvalue:"Select...",
            selectrollabel:"Select...",
            val1:'',
            selectflag:true,
            errorFlag: false
        };
    }

    componentWillUnmount() {
        this._isMounted = false;
    }
    
    componentDidMount() {
    }

    handleSubmit = (event) => {
        event.preventDefault();
        const clientFormData = new FormData(event.target);
        const data = {};
        for (let key of clientFormData.keys()) {
            data[key] = clientFormData.get(key);
        }
        this.setState({errorFlag: false})
        if(this.props.mode==="add"){
            var params = {
                "Email": data.email1,
                "PhoneNumber": data.PhoneNumber,
                "password": data.password1,
                "confirmPassword": data.confirmpassword1,
                "RoleName": data.roles,
            }
            var headers = SessionManager.shared().getAuthorizationHeader();
            Axios.post(API.PostUserData, params, headers)
            .then(result => {
                this.props.onGetUser();
                this.onHide();
                this.setState({selectflag:true})
                this.props.removeState();
            })
            .catch(err => {
                this.setState({errorFlag: true})
                if(err.response.data.ModelState[""]){
                    this.props.postUserError(err.response.data.ModelState[""])
                }else if(err.response.data.ModelState["model.Password"] && !err.response.data.ModelState["model.ConfirmPassword"]){
                    this.props.postUserError(err.response.data.ModelState["model.Password"])
                }else if(err.response.data.ModelState["model.ConfirmPassword"])
                    this.props.postUserError(err.response.data.ModelState["model.ConfirmPassword"])
            });
        }else{
            params = {
                "Id": this.props.userID,
                "PhoneNumber": data.PhoneNumber,
                "RoleName": data.roles,
            }
            headers = SessionManager.shared().getAuthorizationHeader();
            Axios.post(API.PostUserUpdate, params, headers)
            .then(result => {
                this.props.onGetUser()
                this.onHide();
                this.setState({selectflag:true})
                this.props.removeState();
            })
            .catch(err => {
            });
        }
    }

    getRoles (value) {
        this.setState({val1:value.value})
    }
    
    onHide = () => {
        this.props.onHide();
        Common.hideSlideForm();
    }

    render(){   
        let updateData = [];
        let roles = [];
        // let roledata=''
        if(this.props.userUpdateData){
            updateData=this.props.userUpdateData;
            roles = updateData.roles;
            console.log('11123', updateData)
            if(roles){
                // roledata=roles[0].name;
            }
        }
        return (
            <div className = "slide-form__controls open" style={{height: "100%"}}>
                <div style={{marginBottom:30}}>
                    <i className="fas fa-times slide-close" style={{ fontSize: 20, cursor: 'pointer'}} onClick={()=>this.onHide()}></i>
                </div>
                <Form className="container" onSubmit = { this.handleSubmit }>
                    <Col className="title add-product">{trls('Add_Product')}</Col>
                    {this.state.errorFlag && (
                        <ListErrors errors={this.props.error}/>
                    )}
                    {this.props.mode==="add" && (
                        <Form.Group as={Row} controlId="formPlaintextPassword">
                            <Col className="product-text">
                                <Form.Control type="email" name="email1" defaultValue={this.props.mode==="update" ? updateData.Email : ''} required placeholder={trls('Email')}/>
                                <label className="placeholder-label">{trls('Email')}</label>
                            </Col>
                        </Form.Group>
                    )
                    }
                    {this.props.mode==="add" && (
                        <Form.Group as={Row} controlId="formPlaintextPassword">
                            <Col className="product-text">
                                <Form.Control type="password" name="password1" required placeholder={trls('Password')}/>
                                <label className="placeholder-label">{trls('Password')}</label>
                            </Col>
                        </Form.Group>
                    )
                    }
                    {this.props.mode==="add" && (
                        <Form.Group as={Row} controlId="formPlaintextPassword">
                            <Col className="product-text">
                                <Form.Control type="password" name="confirmpassword1" required placeholder={trls('ConfirmPassword')}/>
                                <label className="placeholder-label">{trls('ConfirmPassword')}</label>
                            </Col>
                        </Form.Group>
                    )
                    }
                    <Form.Group as={Row} controlId="formPlaintext">
                        <Col className="product-text">
                            <Form.Control type="text" name="PhoneNumber" defaultValue={this.props.mode==="update" ? updateData.PhoneNumber : ''} required placeholder={trls('PhoneNumber')} />
                            <label className="placeholder-label">{trls('PhoneNumber')}</label>
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} controlId="formPlaintextSupplier">
                        <Col>
                            <Select
                                name="roles"
                                placeholder={trls('Roles')}
                                options={this.state.roles}
                                onChange={val => this.setState({val1: val})}
                            />
                            <label className="placeholder-label">{trls('Roles')}</label>
                            {!this.props.disabled&&this.props.mode==="add" && (
                                <input
                                    onChange={val=>console.log()}
                                    tabIndex={-1}
                                    autoComplete="off"
                                    style={{ opacity: 0, height: 0 }}
                                    value={this.state.val1}
                                    required
                                />
                            )}
                        </Col>
                    </Form.Group>
                    <Form.Group >
                        <Col>
                            <Button type="submit" style={{width:"100px"}}>{trls('Save')}</Button>
                        </Col>
                    </Form.Group>
                </Form>
                {/* } */}
            </div>
        );
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(Adduserform);