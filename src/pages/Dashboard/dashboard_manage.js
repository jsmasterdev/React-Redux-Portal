import React, {Component} from 'react'
import { connect } from 'react-redux';
import { trls } from '../../components/translate';
import { Container, Row, Col, Button, Spinner } from 'react-bootstrap';
import SessionManager from '../../components/session_manage';
import API from '../../components/api'
import Axios from 'axios';
import FlashMassage from 'react-flash-message';

const mapStateToProps = state => ({ 
    ...state.auth,
});

const mapDispatchToProps = (dispatch) => ({

});

class Dashboardmanage extends Component {
    _isMounted = false;
    constructor(props) {
        super(props);
        this.state = {  
            exactFlag: false,
            sendingFlag: false,
        };
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    componentDidMount() {

    }

    sendSalesOrderExactSend = () => {
        this.setState({sendingFlag: true, exactFlag: false})
        let param = {};
        var headers = SessionManager.shared().getAuthorizationHeader();
        Axios.get(API.GenerateSalesInvoiceXmlExact, headers)
        .then(result => {
            Axios.get(API.GetSalesOrdersExact, headers)
            .then(result => {
                if(result.data.Items.length){
                    let orderIds = result.data.Items;
                    let idsLength = result.data.Items.length;
                    orderIds.map((data, key)=>{
                        param = {
                            salesid: data.SalesOrderHeaderId
                        }
                        Axios.post(API.PostSalesOrderExactSend, param, headers)
                        .then(result => {
                            if(idsLength-1===key){
                                this.setState({exactFlag: true, sendingFlag: false});
                            }
                        });
                        return data;
                    })
                }else{
                    this.setState({exactFlag: true, sendingFlag: false});
                }
                
            });
            
        });
    }
    sendPurchaseOrderExactSend = () => {
        this.setState({sendingFlag: true, exactFlag: false})
        let param = {};
        var headers = SessionManager.shared().getAuthorizationHeader();
        Axios.get(API.GeneratePurchaseInvoiceXmlExact, headers)
        .then(result => {
            Axios.get(API.GetPurchaseOrdersExact, headers)
            .then(result => {
                if(result.data.Items.length){
                    let idsLength = result.data.Items.length;
                    let orderIds = result.data.Items;
                    orderIds.map((data, key)=>{
                        param = {
                            id: data.PurchaseOrderHeaderId
                        }
                        Axios.post(API.PostPurchaseOrderExactSend, param, headers)
                        .then(result => {
                            if(idsLength-1===key){
                                this.setState({exactFlag: true, sendingFlag: false});
                            }
                        });
                        return data;
                    })
                    
                }else{
                    this.setState({exactFlag: true, sendingFlag: false});
                }
                
            });
        });
    }
    
    render(){   
        return (
            <Container>
                <div className="dashboard-header content__header content__header--with-line">
                    <h2 className="title">{trls('Dashboard')}</h2>
                </div>
                <div className="exact-send__message">
                    {this.state.exactFlag&&(
                        <div>
                            <FlashMassage duration={100000}>
                                <div className="alert alert-success" style={{marginTop:10, marginBottom: 0}}>
                                    <strong><i className="fas fa-check-circle"></i> Success!</strong>
                                </div>
                            </FlashMassage>
                        </div>
                    )
                    }
                    {this.state.sendingFlag&&(
                        <div style={{marginTop:10}}><Spinner animation="border" variant="info"/><span style={{marginTp:10, fontWeight: "bold", fontSize: 16}}> {trls('Sending')}...</span></div>
                    )}
                </div>
                <Row className="dashboard-container">
                    <Col sm={4} className="top-content" >
                        <div className="Xml-Exact">
                            <Button type="submit" className="exact-send__button" onClick={()=>this.sendSalesOrderExactSend()}><i className="fas fa-file-export"></i> {trls('SalesOrderExactSend')}</Button>
                        </div>
                        <div className="Xml-Exact">
                            <Button type="submit" className="exact-send__button" onClick={()=>this.sendPurchaseOrderExactSend()}><i className="fas fa-file-export"></i> {trls('PurchaseOrderExactSend')}</Button>
                        </div>
                    </Col>
                </Row>
            </Container>
        );
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(Dashboardmanage);