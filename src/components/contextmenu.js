import React, {Component} from 'react';
import { connect } from 'react-redux';
import { ContextMenu, MenuItem, ContextMenuTrigger } from 'react-contextmenu';
import { trls } from './translate';

const mapStateToProps = state => ({ 
    ...state,
});

const mapDispatchToProps = (dispatch) => ({
});
class Contextmenu  extends Component {
    _isMounted = false;
    constructor(props) {
        super(props);
        this.state = {  
        };
    }

    addFiltercolumn = (value) => {
        this.props.addFilterColumn(value);
    }

    removeColumn = (value) => {
        this.props.removeColumn(value);
    }

    render(){
        const{triggerTitle} = this.props
        return (
            <div>
                <ContextMenuTrigger id={triggerTitle}>
                    {triggerTitle}
                </ContextMenuTrigger>
                <ContextMenu id={triggerTitle}>
                    <MenuItem
                        data={{ action: 'add' }}
                        onClick={()=>this.addFiltercolumn(triggerTitle)}
                    // attributes={attributes}
                    >
                        {trls("Filter_by_this_field")}
                    </MenuItem>
                    <MenuItem
                        data={{ action: 'remove' }}
                        onClick={()=>this.removeColumn(triggerTitle)}
                    // attributes={attributes}
                    >
                        {trls("Hide_column")}
                    </MenuItem>
                </ContextMenu>
            </div>
        );
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(Contextmenu);