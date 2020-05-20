import React, {Component} from 'react'
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { connect } from 'react-redux';
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

class Languageform extends Component {
    _isMounted = false;
    constructor(props) {
        super(props);
        this.state = {  
            language: [{"value":"en_US","label":"English"},{"value":"nl_BE","label":"Dutch"}],
        };
    }
    componentWillUnmount() {
        this._isMounted = false;
    }
    
    componentDidMount() {
        this.setState({files: this.props.files})
    }

    changePDFLang = (value) => {
        localStorage.setItem('nevema_lang_PDF', value.value);
    }

    render(){
        const { language } = this.state;
        const { pdfLanguage } = this.props;
        let defaultLang = language.filter((item, key)=>item.label===pdfLanguage);
        return (
            <Modal
                show={this.props.show}
                dialogAs={DraggableModalDialog}
                onHide={()=>this.props.onHide()}
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
                <Form.Group as={Row} controlId="formPlaintextPassword">
                    <Col className="product-text">
                        <Select
                            name="lang"
                            options={language}
                            onChange={val => this.changePDFLang(val)}
                            defaultValue={defaultLang}
                        />
                        <label className="placeholder-label">{trls('Language')}</label>
                        {!this.props.disabled && (
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
                <Form.Group style={{textAlign:"center"}}>
                    <Button type="button" style={{width: 80}} onClick={()=>this.props.onHide()}>OK</Button>
                </Form.Group>
            </Modal.Body>
            </Modal>
        );
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(Languageform);