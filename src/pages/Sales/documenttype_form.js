import React, {Component} from 'react'
import { Modal, Button } from 'react-bootstrap';
import { connect } from 'react-redux';
import SessionManager from '../../components/session_manage';
import API from '../../components/api'
import Axios from 'axios';
import { trls } from '../../components/translate';
import "react-datepicker/dist/react-datepicker.css";
import Select from 'react-select';
import * as salesAction  from '../../actions/salesAction';
import DraggableModalDialog from '../../components/draggablemodal';

const mapStateToProps = state => ({ 
    ...state.auth,
});

const mapDispatchToProps = (dispatch) => ({
    setUploadFile: (params) =>
        dispatch(salesAction.setUploadFile(params))
});

class Goaltype extends Component {
    _isMounted = false;
    constructor(props) {
        super(props);
        this.state = {  
            typeData: [],
            filse: []
        };
    }
    componentWillUnmount() {
        this._isMounted = false;
    }
    
    componentDidMount() {
        this.setState({files: this.props.files})
    }

    getDocumentType = () => {
        var headers = SessionManager.shared().getAuthorizationHeader();
        Axios.get(API.GetDocumenttypesDropdown, headers)
        .then(result => {
            this.setState({typeData: result.data.Items});
        });
    }

    setDocumentType = (file_id, val) => {
        let files = this.props.files; 
        files[file_id]['doctype'] = val.value;
        this.setState({files: files});
    }

    onHide = () => {
        this.props.setUploadFile(this.state.files)
        this.props.onHide();
        this.setState({
            typeData: [],
            filse: []
        })
    } 

    setTypeOption = (value) => {
      var item = this.props.typedata.filter(item => item.key===value);
      var returnValue = {value: item[0].key, label: item[0].value}
      return returnValue;
    }

    render(){
        let typeData = [];
        let files = [];
        if(this.props.typedata){
            typeData = this.props.typedata.map( s => ({value:s.key,label:s.value}));
        }
        if(this.props.files){
            files = this.props.files;
        }
        return (
            <Modal
                show={this.props.show}
                dialogAs={DraggableModalDialog}
                onHide={()=>this.onHide()}
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                backdrop= "static"
                centered
            >
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">
                    {trls('DocumentType')}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <table id="user_table" className="place-and-orders__table table table--striped" width="100%">
                    <thead>
                        <tr>
                            <th>File</th>
                            <th style={{borderRight: '1px solid #ddd'}}>DocumentType</th>
                        </tr>
                    </thead>
                    {files &&(<tbody >
                        {
                            files.map((data,i) =>(
                                <tr id={i} key={i}>
                                    <td>{data.name}</td>
                                    <td>
                                        <Select
                                            name="type"
                                            options={typeData}
                                            className="select-user-class"
                                            placeholder={trls('Select')}
                                            onChange={val => this.setDocumentType(i, val)}
                                            defaultValue={this.setTypeOption(data.doctype)}
                                        />
                                    </td>
                                </tr>
                        ))
                        }
                    </tbody>)}
                </table>
                <div style={{textAlign: 'center'}}>
                    <Button style={{width:"100px"}} onClick={()=>this.onHide()}>OK</Button>
                </div>
            </Modal.Body>
            </Modal>
        );
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(Goaltype);