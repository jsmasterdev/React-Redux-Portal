import React, {Component} from 'react'
import { Modal, Button } from 'react-bootstrap';
import { connect } from 'react-redux';
import { trls } from '../../components/translate';
import API from '../../components/api';
import * as Common from '../../components/common';
import Axios from 'axios';
import SessionManager from '../../components/session_manage';

const mapStateToProps = state => ({ 
    ...state,
});

const mapDispatchToProps = (dispatch) => ({
});

class Purhcaselinkechangeform extends Component {
    _isMounted = false;
    constructor(props) {
        super(props);
        this.state = {  
            purchaseLineDataArray: []
        };
    }
    
    componentWillUnmount() {
        this._isMounted = false;
    }
    
    componentDidMount() {
    }

    changePurchasePrice = (orderId) => {
        let purchaselinedata = this.props.purchaselinedata;
        let purchaseArray = [];
        purchaselinedata.map((data, index)=>{
            if(data.orderId===orderId){
                if(data.checked){
                    data.checked = false
                }else{
                    data.checked = true
                }
            }
            if(data.checked){
                purchaseArray.push(data)
            }
            return data;
        });
        this.setState({purchaseLineDataArray: purchaseArray})
    }

    updatePricePurchaseLine = () => {
        var headers = SessionManager.shared().getAuthorizationHeader();
        let params = {};
        this.state.purchaseLineDataArray.map((data, index)=>{
                params = {
                    orderlineid: data.orderLineId,
                    newprice: this.props.newprice,
                }
                Axios.post(API.UpdatePricePurchaseLines, params, headers)
                .then(result => {
                    this.props.onHide();
                    this.setState({
                        purchaseLineDataArray: []
                    })
                })
            return data;
        })
        
    }

    render(){
        let purchaseLineData = this.props.purchaselinedata;
        return (
            <Modal
                show={this.props.show}
                onHide={this.props.onHide}
                size="xl"
                aria-labelledby="contained-modal-title-vcenter"
                backdrop= "static"
                centered
            >
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">
                    {trls('Purchase')}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="table-responsive credit-history">
                    <table id="example" className="place-and-orders__table table table--striped prurprice-dataTable" width="100%">
                        <thead>
                            <tr>
                                <th></th>
                                <th>{trls('Productcode')}</th>
                                <th>{trls('Loading_Date')}</th>
                                <th>{trls('Description')}</th>
                                <th>{trls('Purchase_Quantity')}</th>
                                <th>{trls('Purchase_Price')}</th>
                            </tr>
                        </thead>
                        {purchaseLineData && (<tbody >
                            {
                                purchaseLineData.map((data,i) =>(
                                    <tr id={i} key={i}>
                                        <td><input type="checkbox" onChange={()=>this.changePurchasePrice(data.orderId)} /></td>
                                        <td>{data.ProductCode}</td>
                                        <td>{data.ProductDescription}</td>
                                        <td>{Common.formatDate(data.Loadingdate)}</td>
                                        <td>{data.PurchaseQuantity}</td>
                                        <td>{Common.formatMoney(data.PurchasePrice)}</td>
                                    </tr>
                            ))
                            }
                        </tbody>)}
                    </table>
                    {this.state.purchaseLineDataArray.length>0 ?(
                        <Button variant="primary" style={{height: 40, borderRadius: 20, float: 'right'}} onClick={()=>this.updatePricePurchaseLine()}>{trls('Submit')}</Button>
                    ):
                        <Button variant="primary" style={{height: 40, borderRadius: 20, float: 'right'}} disabled onClick={()=>this.updatePricePurchaseLine()}>{trls('Submit')}</Button>
                    }
                    
                </div>
            </Modal.Body>
            </Modal>
        );
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(Purhcaselinkechangeform);