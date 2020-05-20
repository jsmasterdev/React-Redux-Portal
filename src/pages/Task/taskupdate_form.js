import React, {Component} from 'react'
import { Modal, Form, Button, Row, Col } from 'react-bootstrap';
import Select from 'react-select';
import { connect } from 'react-redux';
import SessionManager from '../../components/session_manage';
import API from '../../components/api'
import Axios from 'axios';
import { trls } from '../../components/translate';
import DraggableModalDialog from '../../components/draggablemodal';

const mapStateToProps = state => ({ 
    ...state,
});

const mapDispatchToProps = (dispatch) => ({
});
class Taskupdate  extends Component {
    _isMounted = false;
    constructor(props) {
        super(props);
        this.state = {  
            taskTypes: [],
            taskTypeValue:'',
            taskTypeLabel: '',
            taskStatus: [],
            taskStatusValue: '',
            taskStatusLabel: '',
            taskUpdateData: [],
            taskProducts: [],
            taskProductLabel: '',
            taskProductValue: '',
            taskUsers: [],
            taskUserValue: '',
            taskUserLabel: ''
        };
    }
    componentWillUnmount() {
        this._isMounted = false;
    }
    componentDidMount() {
       
    }

    getTaskTypes = () => {
        let taskUpdateData=this.props.taskUpdateData;
        this.props.detailmode()
        var headers = SessionManager.shared().getAuthorizationHeader();
        Axios.get(API.GetTasktypeDropdown, headers)
        .then(result => {
            let tempArray = [];
            tempArray = result.data.Items;
            tempArray.map((data, index) => {
                if(data.key===taskUpdateData[0].TaskTypeId){
                    this.setState({taskTypeValue: data.key, taskTypeLabel: data.value})
                }
                return tempArray;
            })
            this.setState({taskTypes: result.data.Items});
        });
    }

    getTaskStatus = () => {
        let taskUpdateData=this.props.taskUpdateData;
        var headers = SessionManager.shared().getAuthorizationHeader();
        Axios.get(API.GetTaskstatusDropdown, headers)
        .then(result => {
            let tempArray = [];
            tempArray = result.data.Items;
            tempArray.map((data, index) => {
                if(data.key===taskUpdateData[0].TaskStatusId){
                    this.setState({taskStatusValue: data.key, taskStatusLabel: data.value})
                }
                return tempArray;
            })
            this.setState({taskStatus: result.data.Items});
        });
    }

    getProducts = () => {
        let taskUpdateData=this.props.taskUpdateData;
        var headers = SessionManager.shared().getAuthorizationHeader();
        Axios.get(API.GetProductsDropdown, headers)
        .then(result => {
            let tempArray = [];
            tempArray = result.data.Items;
            tempArray.map((data, index) => {
                if(data.key===taskUpdateData[0].ProductId){
                    this.setState({taskProductValue: data.key, taskProductLabel: data.value})
                }
                return tempArray;
            })
            this.setState({taskProducts: result.data.Items});
        });
    }

    getUsers = () => {
        let taskUpdateData=this.props.taskUpdateData;
        var headers = SessionManager.shared().getAuthorizationHeader();
        Axios.get(API.GetUsersDropdown, headers)
        .then(result => {
            let tempArray = [];
            tempArray = result.data.Items;
            tempArray.map((data, index) => {
                if(data.key===taskUpdateData[0].UserId){
                    this.setState({taskUserValue: data.key, taskUserLabel: data.value})
                }
                return tempArray;
            })
            this.setState({taskUsers: result.data.Items});
        });
    }

    componentDidUpdate(){
        if(this.props.taskId){
            this.setState({taskUpdateData: this.props.taskUpdateData, taskId: this.props.taskId})
            this.getTaskTypes();
            this.getTaskStatus();
            this.getProducts();
            this.getUsers();
        }
    }

    changeTaskType = (val) => {
        this.setState({taskTypeValue: val.value, taskTypeLabel: val.label})
    }

    changeEmployee = (val) => {
        this.setState({selectEmployee:val});
    }

    handleSubmit = (event) => {
        event.preventDefault();
        const clientFormData = new FormData(event.target);
        const data = {};
        for (let key of clientFormData.keys()) {
            data[key] = clientFormData.get(key);
        }
        let params = {
            tasktype: data.tasktype,
            taskstatus: data.taskstatus,
            subject: data.subject,
            description: data.description,
            product: data.product,
            user: data.user,
            taskid: this.state.taskId
        }
        var headers = SessionManager.shared().getAuthorizationHeader();
        Axios.post(API.PutTask , params, headers)
        .then(result => {
            this.props.onHide();
            this.props.onGetTaskData();
        });
    }
    render(){
        let taskTypes = [];
        let taskStatus = [];
        let subject = '';
        let description = '';
        let taskProducts = [];
        let taskUsers = [];
        if(this.state.taskTypes){
            taskTypes = this.state.taskTypes.map( s => ({value:s.key,label:s.value}) );
        }
        if(this.state.taskStatus){
            taskStatus = this.state.taskStatus.map( s => ({value:s.key,label:s.value}) );
        }
        if(this.state.taskUpdateData[0]){
            subject = this.state.taskUpdateData[0].Subject
        }
        if(this.state.taskUpdateData[0]){
            description = this.state.taskUpdateData[0].Description
        }
        if(this.state.taskProducts){
            taskProducts = this.state.taskProducts.map( s => ({value:s.key,label:s.value}) );
        }
        if(this.state.taskUsers){
            taskUsers = this.state.taskUsers.map( s => ({value:s.key,label:s.value}) );
        }
        return (
            <Modal
            show={this.props.show}
            dialogAs={DraggableModalDialog}
            onHide={this.props.onHide}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            backdrop= "static"
            centered
            >
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">
                    {trls('Edit_Task')}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form className="container product-form" onSubmit = { this.handleSubmit }>
                    <Form.Group as={Row} controlId="formPlaintextSupplier">
                        <Form.Label column sm="3">
                            {trls('Tasktype')}
                        </Form.Label>
                        <Col sm="9" className="product-text">
                            <Select
                                name="tasktype"
                                placeholder={trls('Select')}
                                value={{"label":this.state.taskTypeLabel,"value":this.state.taskTypeValue}}
                                options={taskTypes}
                                onChange={val => this.changeTaskType(val)}
                            />
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} controlId="formPlaintextSupplier">
                        <Form.Label column sm="3">
                            {trls('TaskStatus')}
                        </Form.Label>
                        <Col sm="9" className="product-text">
                            <Select
                                name="taskstatus"
                                placeholder={trls('Select')}
                                value={{"label":this.state.taskStatusLabel,"value":this.state.taskStatusValue}}
                                options={taskStatus}
                                onChange={val => this.changeTaskType(val)}
                            />
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} controlId="formPlaintextPassword">
                        <Form.Label column sm="3">
                        {trls('Subject')}   
                        </Form.Label>
                        <Col sm="9" className="product-text">
                            <Form.Control type="text" name="subject" defaultValue={subject} required placeholder={trls('Subject')} />
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} controlId="formPlaintextPassword">
                        <Form.Label column sm="3">
                        {trls('Description')}   
                        </Form.Label>
                        <Col sm="9" className="product-text">
                            <Form.Control type="text" name="description" defaultValue={description} required placeholder={trls('Description')} />
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} controlId="formPlaintextSupplier">
                        <Form.Label column sm="3">
                            {trls('Products')}
                        </Form.Label>
                        <Col sm="9" className="product-text">
                            <Select
                                name="product"
                                placeholder={trls('Select')}
                                value={{"label":this.state.taskProductLabel,"value":this.state.taskProductValue}}
                                options={taskProducts}
                                onChange={val => this.changeTaskType(val)}
                            />
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} controlId="formPlaintextSupplier">
                        <Form.Label column sm="3">
                            {trls('User')}
                        </Form.Label>
                        <Col sm="9" className="product-text">
                            <Select
                                name="user"
                                placeholder={trls('Select')}
                                value={{"label":this.state.taskUserLabel,"value":this.state.taskUserValue}}
                                options={taskUsers}
                                onChange={val => this.changeTaskType(val)}
                            />
                        </Col>
                    </Form.Group>
                    <Form.Group style={{textAlign:"center"}}>
                        <Button type="submit" style={{width:"100px"}}>{trls('Save')}</Button>
                    </Form.Group>
                </Form>
            </Modal.Body>
            </Modal>
        );
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(Taskupdate);