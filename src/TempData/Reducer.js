export const initialState = {
    search: null,
    back: null,
    newdata: null,
    oopsError: {open: false, message: null},
};

export const actionTypes = {
    SEARCH: "SEARCH",
    BACK: "BACK",
    NEWDATA: "NEWDATA",
    OOPSERROR: "OOPSERROR",
}

const Reducer = (state, action) => {
    switch (action.type) {
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
        case actionTypes.OOPSERROR:
            return {
                ...state,
                oopsError: action.oopsError
            };
        default:
            return state;
    }
}

export default Reducer;
