import './oopsSomethingWentWrong.css';
import {Modal} from "@material-ui/core";

function OopsSomethingWentWrong({open, onClose, message}) {
    return (
        <Modal open={open} onClose={() => {onClose()}} className="OopsSomethingWentWrong">
            <div className={"OopsSomethingWentWrong__container"}>
                <p>{message ?? "Oops, Something went wrong!"}</p>
            </div>
        </Modal>
    );
}

export default OopsSomethingWentWrong;
