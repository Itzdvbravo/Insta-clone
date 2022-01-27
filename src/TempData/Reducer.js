export const initialState = {
    cip: null,
    search: null,
    back: null,
    newdata: null
};

export const actionTypes = {
    CHANGE_IN_POST: "CHANGE_IN_POST",
    SEARCH: "SEARCH",
    BACK: "BACK",
    NEWDATA: "NEWDATA"
}

const Reducer = (state, action) => {
    switch (action.type) {
        case actionTypes.CHANGE_IN_POST:
            return {
                ...state,
                cip: action.cip
            };
        case actionTypes.SEARCH:
            return {
                ...state,
                search: action.search
            };
        case actionTypes.BACK:
            return {
                ...state,
                back: action.back
            };
        case actionTypes.NEWDATA:
            return {
                ...state,
                newdata: action.newdata
            };
        default:
            return state;
    }
}

export default Reducer;
