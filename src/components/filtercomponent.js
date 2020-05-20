import React from 'react';
import { Form, Col } from 'react-bootstrap';
import Select from 'react-select';
import { trls } from './translate';
import DatePicker from "react-datepicker";

class Filtercomponent extends React.Component {
    _isMounted = false
    constructor(props) {
        super(props);
        this.state = {  
            conditions: [{"value": "And", "label": "And"}, {"value": "Or", "label": "Or"}],
            actions: [{"value": "Contains", "label": "Contains"}, {"value": "Is", "label": "Is"}],
            dateaActions: [{"value": "Between", "label": "Between"}],
            filterData: this.props.filterData,
            filterOptionData: [],
            selectDate: new Date(),
            endDate: new Date(),
            datePickerFlag: false
        };

    }
    
    addFilterOption = () => {
        let filterOptionData = this.state.filterOptionData;
        let data = [];
        data.startDate = this.state.selectDate;
        data.endDate = this.state.endDate;
        if(filterOptionData.length===0){
            data.condition = 'where';
        }
        filterOptionData.push(data);
        this.setState({filterOptionData: filterOptionData});
    }

    removeFilterOption = (index, dataOption) => {
        let arr = this.state.filterOptionData;
        arr = arr.filter(function(item, key) {
            return key !== index
        })
        this.setState({filterOptionData: arr});
    }

    handleEnterKeyPress = (e, index, mode) => {
        this.setState({flag: true});
        if(e.target.value.length===4){
            let today = new Date();
            let year = today.getFullYear();
            let date_day_month = e.target.value;
            let day = date_day_month.substring(0,2);
            let month = date_day_month.substring(2,4);
            let setDate = new Date(year + '-'+ month + '-' + day)
            let arr = this.state.filterOptionData;
            arr.map((item, key)=>{
                if(key===index){
                    if(mode==="start"){
                        item.startDate = setDate;
                    }else{
                        item.endDate = setDate;
                    }
                }
                return item;
            })
            this.setState({filterOptionData: arr});
            if(mode==="start"){
                this.setState({selectDate: setDate})
            }else{
                this.setState({endDate: setDate})
            }
        }
    }

    onChangeDate = (date, e, index, mode) => {
        let arr = this.state.filterOptionData;
        if(e.type==="click"){
            arr.map((item, key)=>{
                if(key===index){
                    if(mode==="start"){
                        item.startDate = date;
                    }else{
                        item.endDate = date;
                    }
                }
                return item;
            })
            this.setState({filterOptionData: arr});
            if(mode==="start"){
                this.setState({selectDate: date})
            }else{
                this.setState({endDate: date})
            }
        }
    }

    changeCondition = (val, index) => {
        let arr_condition = this.state.conditions;
        if(val.value==="where"){
            arr_condition = arr_condition.filter(function(item, key) {
                return item.value !== val.value
            })
            this.setState({conditions: arr_condition})
        }
        let arr = this.state.filterOptionData;
        arr.map((item, key)=>{
            if(key===index){
                item.condition = val.value;
            }
            return item;
        })
        this.setState({filterOptionData: arr});
    }

    filterChangeData = (val, index) => {
        let arr = this.state.filterData;
        // arr = arr.filter(function(item, key) {
        //     return item.value !== val.value
        // })
        if(val.type==="date"){
            this.setState({datePickerFlag: true});
        }else{
            this.setState({datePickerFlag: false});
        }
        this.setState({filterData: arr})
        let arr_option = this.state.filterOptionData;
        arr_option.map((item, key)=>{
            if(key===index){
                if(val.type==="date"){
                    item.value = this.state.selectDate;
                    item.dateFlag = true;
                }else{
                    item.dateFlag = false;
                }
                item.filterOption = val.value;
            }
            return item;
        })
        this.setState({filterOptionData: arr_option});
    }

    filterChangeMode = (val, index) => {
        let arr = this.state.filterOptionData;
        arr.map((item, key)=>{
            if(key===index){
                item.mode = val.value;
            }
            return item;
        })
        this.setState({filterOptionData: arr});
    }

    changeValue = (evt, index) => {
        let arr = this.state.filterOptionData;
        arr.map((item, key)=>{
            if(key===index){
                item.value = evt.target.value;
            }
            return item;
        })
        this.setState({filterOptionData: arr});
    }

    onFilterData = () => {
        this.props.onFilterData(this.state.filterOptionData);
        this.props.onHide();
    }

    render() {
        const{filterData, filterOptionData, actions, dateaActions, datePickerFlag}=this.state;
        return (
            <Col sm={4} className={!this.props.showFlag ? "multi-filter__div filter-show__hide" : "multi-filter__div" }>
                {this.state.filterOptionData.map((data, index) =>(
                    <div key={index} style={{display: 'flex', paddingTop: 10, justifyContent: "space-between"}}>
                        {data.condition==="where" ? (
                            <div style={{width: "20%"}}>{filterOptionData[0].condition}</div>
                        ):
                            <Select
                                name="filter"
                                className="filter-header__option"
                                options={this.state.conditions}
                                onChange={(val)=>this.changeCondition(val, index)}
                            /> 
                        }
                        <Select
                            name="filter"
                            className="filter-header__option"
                            options={filterData}
                            onChange={(val)=>this.filterChangeData(val, index)}
                        />
                        {!data.dateFlag && (
                            <Select
                                name="filter"
                                className="filter-header__option"
                                options={datePickerFlag ? dateaActions : actions}
                                onChange={(val)=>this.filterChangeMode(val, index)}
                            />
                        )}
                        {!data.dateFlag ? (
                            <Form.Control className="filter-header__option" type="text" name="number" placeholder="value" onChange={(evt)=>this.changeValue(evt, index)}/>
                        ):
                            <div className="filter-header__option">
                                <DatePicker name="startdate" id="startdatetest" className="myDatePicker filter-date__picker" dateFormat="dd-MM-yyyy" selected={this.state.selectDate} onChange = {(value, e)=>this.onChangeDate(value, e, index, 'start')} customInput={<input onKeyUp={(event)=>this.handleEnterKeyPress(event, index, 'start')}/>}/>
                            </div>
                        }
                        {data.dateFlag && (
                             <div className="filter-header__option">
                                <DatePicker name="enddate" id="enddate" className="myDatePicker filter-date__picker" dateFormat="dd-MM-yyyy" selected={this.state.endDate} onChange = {(value, e)=>this.onChangeDate(value, e, index, 'end')} customInput={<input onKeyUp={(event)=>this.handleEnterKeyPress(event, index, 'end')}/>}/>
                            </div>
                        )}
                        <i className="fas fa-times" style={{ fontSize: 20, cursor: 'pointer', marginTop: 4}} onClick={()=>this.removeFilterOption(index, data.filterOption)}></i>
                    </div>
                ))}
                <div style={{padding:"20px 10px", fontSize: 12, display: 'flex'}}>
                    <span style={{cursor: "pointer"}} onClick={()=>this.addFilterOption()}><i className="fas fa-plus add-icon"></i>{trls('Add_filter')}</span>
                    <span style={{cursor: "pointer", marginLeft: "auto"}} onClick={()=>this.onFilterData()}><i className="fas fa-filter add-icon"></i>{trls('Filter')}</span>
                </div>
            </Col>
        );
    } 
}
export default Filtercomponent;
    