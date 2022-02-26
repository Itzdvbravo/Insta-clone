import './step1.css';
import {useEffect, useState} from "react";
import {AddToPhotos, ChevronLeft, ChevronRight, ImageSharp} from "@material-ui/icons";
import {Button, CircularProgress, makeStyles, Modal} from "@material-ui/core";
import Step2 from "./Step2";
import useWindowSize from '../../customHooks/useWindowSize';
import Step3 from './Step3';
import { uploadPost } from '../../Fetcher';
import {auth, storage} from "../../firebase";
import {uuidv4} from "../../Utils";

function getModalStyle() {
    const top = 50;
    const left = 50;

    return {
        top: `${top}%`,
        left: `${left}%`,
        transform: `translate(-${top}%, -${left}%)`,
    };
}

function getMakeSureModalStyle() {
    const top = 50;
    const left = 50;

    return {
        top: `${top}%`,
        left: `${left}%`,
        transform: `translate(-${top}%, -${left}%)`,
    };
}

const useStyles = makeStyles((theme) => ({
    paper: {
        top: '44%!important',
        position: "absolute",
        margin: '42px 0',
        transition: 'width 0.6s',
        backgroundColor: theme.palette.background.paper,
        boxShadow: theme.shadows[5],
        borderRadius: '14px',
        border: 'none'
    },
    paper2: {
        top: '44%!important',
        position: "absolute",
        margin: '42px 0',
        backgroundColor: theme.palette.background.paper,
        border: "2px solid #000",
        boxShadow: theme.shadows[5],
        padding: theme.spacing(2, 4, 3),
        borderRadius: '14px',
        // border: 'none'
    }
}));

function Step1({open, close}) {
    const [image, setImage] = useState(null);
    const [edittedImageInfo, setEdittedImage] = useState(null)
    const [finalData, setFinalData] = useState(null)

    const [imageOrientation, setImageOrientation] = useState(0);

    const [currentStep, setCurrentStep] = useState(1);
    const [fakeStep, setFakeStep] = useState(1);

    const classes = useStyles()
    const [modalStyle] = useState(getModalStyle);
    const [width, height] = useWindowSize();

    const [makeSure, setMakeSure] = useState(false)

    const submit = (e) => {
        e.preventDefault()
        const fileSelector = document.createElement('input');
        fileSelector.setAttribute('type', 'file');
        fileSelector.setAttribute('multiple', false);
        fileSelector.setAttribute('accept', ".png, .jpeg, .jpg");
        fileSelector.addEventListener('change', addImage)
        fileSelector.click()
    }

    const addImage = (e) => {
        if (e.target.files[0]) {
            var i = e.target.files[0]
            var reader = new FileReader();

            reader.onload = (function (theFile) {
                return function (e) {
                    var img = new Image()
                    img.onload = () => {
                        if (img.naturalWidth > img.naturalHeight) {
                            img.type = 0
                        } else if (img.naturalWidth < img.naturalHeight) {
                            img.type = 1
                        } else {
                            img.type = 2
                        }
                        setImage(img)
                        setImageOrientation(img.type)
                        setCurrentStep(2)
                        setFakeStep(2)
                    }
                    img.src = e.target.result
                };
            })(i);
            reader.readAsDataURL(i);
        }
    }

    useEffect(() => {
        if (currentStep === 1) {
            setImage(null)
        } else if (currentStep === 2) {
            setEdittedImage(false)
        } else if (currentStep === 3) {
            setFinalData(false)
        }
    }, [currentStep])

    useEffect(() => {
        setCurrentStep(fakeStep)
    }, [fakeStep])

    const onClose = (reason) => {
        if (((reason === 'backdropClick' || reason === 'escapeKeyDown') && !image) || (reason !== 'backdropClick' && reason !== 'escapeKeyDown')) {
          close()
          setMakeSure(false)
        } else {
          setMakeSure(true)
        }
    }

    const complete = (lastdata) => {
        const final = {
            'img': edittedImageInfo.src,
            'width': edittedImageInfo.width,
            'height': edittedImageInfo.height,
            'orientation': edittedImageInfo.orientation,
            ...lastdata
        }

        if (!final['orientation'] in [0,1,2]) {
            close()
            alert('Unknown orientation type')
        } else if (!typeof (final['caption']) == 'string' || final['caption'].length > 2000) {
            close()
            alert('Bad caption format')
        } else if (final["width"] > 1000 || final["height"] > 1000) {
            close()
            alert("Bad image format")
        } else {
            var name = uuidv4()
            var s = storage.ref(`images/${name}`).put(edittedImageInfo.blob)
            s.on('state_changed', () => { },
                (error) => { console.log(error); },
                () => {
                    storage
                        .ref("images")
                        .child(name)
                        .getDownloadURL()
                        .then((url) => {
                            uploadPost({...final, img: url, origin: name}).then(() => {
                                close()
                            })
                        });
                });
            //work here
            // uploadPost(final).then(() => {
            //     close(true)
            // })
        }
    }

    return (
        <div className="Step1">
            <Modal open={makeSure} onClose={(e, r) => setMakeSure(false)}>
                <div style={{...getMakeSureModalStyle(), width: width > 380 ? `300px` : `${width-102}px`}} className={classes.paper2}>
                    <div className="makesure">
                        <div className="makesure__header">
                            <h3>Discard Post?</h3>
                            <p className="makesure__headerExtra">If you leave now, {makeSure == 'removeimg' ? <span> you will lose your edits made</span>: <span> you will lose any changes you've made.</span>}</p>
                        </div>
                        <div className="makesure__option">
                            <Button variant="text" className="makesure__optionDiscard" onClick={() => {if (makeSure == 'removeimg'){setCurrentStep(1);setMakeSure(false)} else onClose('manual')}}>Discard</Button>
                            <Button onClick={() => setMakeSure(false)}>Cancel</Button>
                        </div>
                    </div>
                </div>
            </Modal>
            <Modal open={open} onClose={(e, r) => onClose(r)}>
                <div style={{...modalStyle, width: width < 505 ? `${width-20}px` : currentStep == 3 ? 'unset' : '500px'}} className={classes.paper}>
                    <form className="imageupload">
                        <div className="imageupload__header">
                            {currentStep > 1 && currentStep < 4 && (
                                <ChevronLeft className='imageupload__currentStepChanger' onClick={() => {if (currentStep == 2) {setMakeSure('removeimg')} else {setFakeStep(currentStep-1)}}}/>
                            )}
                            <center style={{width: '100%'}}>
                                {(currentStep === 1 || currentStep === 3) && (
                                    <p>Create New Post</p>
                                )}
                                {currentStep === 2 && (
                                    <p>Crop</p>
                                )}
                            </center>
                            {currentStep > 1 && currentStep < 4 && (
                                <ChevronRight className='imageupload__currentStepChanger' onClick={() => {setFakeStep(currentStep+1)}}/>
                            )}
                        </div>
                        {currentStep === 1 && (
                            <div className="no-image__horizontal" style={{height: width < 505 ? `${width-20}px` : '500px'}}>
                                <div className="no-image">
                                    <AddToPhotos className='no-image__addphotoslogo'/>
                                    <p>Drag photos and videos here</p>
                                    <Button variant={"contained"} className="submit-btn" type="submit" onClick={submit}>
                                        Select from computer
                                    </Button>
                                </div>
                            </div>
                        )}
                        {currentStep === 2 && (
                            <Step2 originalImage={image} orientation={imageOrientation} setOrientation={setImageOrientation} setEdittedImage={setEdittedImage} edittedImage={edittedImageInfo} setCurrentStep={setCurrentStep} fakeStep={fakeStep}/>
                        )}
                        {currentStep === 3 && edittedImageInfo && (
                            <Step3 image={edittedImageInfo} step={fakeStep} complete={complete}/>
                        )}
                        {currentStep === 4 && (
                            <center><CircularProgress /></center>
                        )}
                    </form>
                </div>
            </Modal>
        </div>
    );
}

export default Step1;
