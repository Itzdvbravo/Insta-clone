import './step2.css';
import React, { useEffect, useState } from "react";
import useWindowSize from '../../customHooks/useWindowSize';
import { Crop169, CropPortrait, CropSquare, MenuOpen, ZoomIn } from '@material-ui/icons';
import { Button, Menu, MenuItem, Slider } from '@material-ui/core';
import { useContext } from 'react';
import isMobileContext from '../../Contexts/isMobileContext';

function Step2({ originalImage, orientation, setOrientation, setEdittedImage, edittedImage, setCurrentStep, fakeStep }) {
    const isMobile = (useContext(isMobileContext))["isMobile"][1]
    const [w, h] = useWindowSize()
    const [width, setWidth] = useState(0)
    const [height, setHeight] = useState(0)
    const [holderWidth, setholderWidth] = useState(0)
    const [holderHeight, setholderHeight] = useState(0)
    const [transform, setTransform] = useState([[0, 0], 1])
    const [gle, setGle] = useState(null)
    const [draggable, setDraggable] = useState(false)

    const [active, setActive] = useState(false)
    const [edittedOrientation, setEdittedOrientation] = useState(orientation)

    useEffect(() => {
        if (fakeStep && fakeStep === 3) {
            const img = document.querySelector(".step2__image");
            const panner = (document.querySelector(".panner")).getBoundingClientRect();
            const dimension = img.getBoundingClientRect();
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            canvas.width = holderWidth
            canvas.height = holderHeight
            ctx.drawImage(
                originalImage,
                0,
                0,
                originalImage.width,
                originalImage.height,
                -1 * (panner.left - dimension.left),
                -1 * (panner.top - dimension.top),
                width * transform[1],
                height * transform[1],
            )
            const base64Image = canvas.toDataURL("image/jpeg");
            const im = new Image();
            im.onload = () => {
                im.orientation = edittedOrientation
                setCurrentStep(3)
                canvas.toBlob(function (blob) {
                    im.blob = blob
                    setEdittedImage(im)
                }, "image/jpeg", 1)
            }
            im.src = base64Image
        }
    }, [fakeStep])

    useEffect(() => {
        if (edittedOrientation || edittedOrientation === 0) {
            const px = w < 505 ? w - 20 : 500;
            //Holder orientation
            let holderChangeW = 0;
            let holderChangeH = 0;
            if (edittedOrientation === 0) {
                holderChangeW = px
                holderChangeH = 280
            } else if (edittedOrientation === 1) {
                holderChangeH = px
                holderChangeW = px - (px * 0.24)
            } else {
                holderChangeH = px
                holderChangeW = px
            }
            setholderWidth(holderChangeW)
            setholderHeight(holderChangeH)
            //Image orientation
            let changeW = 0;
            let changeH = 0;
            if (orientation === 2) {
                changeW = px
            } else {
                if (edittedOrientation === 0) {
                    changeW = px
                } else if (edittedOrientation === 1) {
                    if (orientation === 1) {
                        changeW = px - (px * 0.24)
                        const c = changeW / width;
                        setTransform([[transform[0][0] * c, transform[0][1] * c], transform[1]])
                    } else if (orientation === 0) {
                        changeH = px
                    }
                } else {
                    if (orientation === 0) {
                        changeH = px
                    } else if (orientation === 1) {
                        changeW = px
                    }
                }
            }
            if (changeH === 0) {
                changeH = (originalImage.height / originalImage.width) * changeW
            } else if (changeW === 0) {
                changeW = (originalImage.width / originalImage.height) * changeH
            }
            setWidth(Math.max(changeW, holderChangeW))
            setHeight(Math.max(changeH, holderChangeH))
        }
    }, [edittedOrientation, w, h])

    const [anchorEl, setAnchorEl] = React.useState([]);
    const open = Boolean(anchorEl.length);
    const handleClick = (event, t) => {
        setActive(true)
        setAnchorEl([event.currentTarget, t]);
    };
    const handleClose = () => {
        setActive(false)
        setAnchorEl([]);
    };

    const checkforPanning = () => {
        const im = document.querySelector(".step2__image");
        const panner = (document.querySelector(".panner")).getBoundingClientRect();
        const dimension = im.getBoundingClientRect();

        const convert = im.style.transform;
        const [first, second] = [convert.indexOf('('), convert.indexOf(')')];
        var [x, y] = convert.slice(first + 1, second).split(",")
        var [x, y] = [parseInt(x), parseInt(y)]
        if (dimension.top > panner.top) {
            y = (((height * 1.1) - height) / 2) * (transform[1] > 1.0 ? (transform[1] - 1) * 10 : 0)
        } else if (dimension.bottom < panner.bottom) {
            y = -(Math.max(0, height - holderHeight) + (((height * 1.1) - height) / 2) * (transform[1] > 1.0 ? (transform[1] - 1) * 10 : 0))
        }

        if (dimension.left > panner.left) {
            x = (((width * 1.1) - width) / 2) * (transform[1] > 1.0 ? (transform[1] - 1) * 10 : 0)
        } else if (dimension.right < panner.right) {
            x = -(Math.max(0, width - holderWidth) + (((width * 1.1) - width) / 2) * (transform[1] > 1.0 ? (transform[1] - 1) * 10 : 0))
        }
        setTransform([[x, y], transform[1]])
    }

    const onChangeOrientation = (orien, close) => {
        setEdittedOrientation(orien)
        if (close) {
            handleClose()
        }
    }

    const mouseDown = (e) => {
        if (e.target.classList.contains('step2__image') || e.target.classList.contains('grids')) {
            const im = document.querySelector(".step2__image");

            var x = 0
            var y = 0
            if (im.style.transform) {
                const convert = im.style.transform;
                const [first, second] = [convert.indexOf('('), convert.indexOf(')')];
                var [x, y] = convert.slice(first + 1, second).split(",")
            }

            const x_img_ele = (window.event.clientX ?? window.event.touches[0].clientX) - parseInt(x);
            const y_img_ele = (window.event.clientY ?? window.event.touches[0].clientY) - parseInt(y);
            setGle({ 'x': x_img_ele, 'y': y_img_ele })
            setDraggable(true)
        }
    }

    const mouseMove = (e) => {
        if (draggable && (e.target.classList.contains('step2__image') || e.target.classList.contains('grids'))) {
            const x_cursor = window.event.clientX ?? window.event.touches[0].clientX;
            const y_cursor = window.event.clientY ?? window.event.touches[0].clientY;

            setTransform([[x_cursor - gle['x'], y_cursor - gle['y']], transform[1]])
        }
    }

    return (
        <div className="Step2" style={{ height: w < 505 ? `${w - 20}px` : '500px' }}>
            <Menu
                id="basic-menu"
                anchorEl={anchorEl[0]}
                open={open}
                onClose={handleClose}
                className={"step2__menu"}
                MenuListProps={{
                    'aria-labelledby': 'basic-button',
                }}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                style={{ backgroundColor: 'transparent' }}
            >
                {anchorEl[1] === 0 && (
                    <div className='step2__menu-changeOritentation'>
                        <MenuItem onClick={() => { onChangeOrientation(2, true) }} className={edittedOrientation === 2 ? 'active' : ''}><p>1:1</p><CropSquare /></MenuItem>
                        <MenuItem onClick={() => { onChangeOrientation(1, true) }} className={edittedOrientation === 1 ? 'active' : ''}><p>4:5</p><CropPortrait /></MenuItem>
                        <MenuItem onClick={() => { onChangeOrientation(0, true) }} className={edittedOrientation === 0 ? 'active' : ''}><p>16:9</p><Crop169 /></MenuItem>
                    </div>
                )}
                {anchorEl[1] === 1 && (
                    <MenuItem><Slider value={transform[1]} step={0.1} min={1} max={2} onChange={(_, value) => { setTransform([[...transform[0]], value]) }} style={{ width: '50px' }} /></MenuItem>
                )}
            </Menu>
            <div className={"step2__imagebody"}>
                <div className={"step2__imagebodyV"}>
                    <div className={"step2__imageOuterContainer"} style={{ width: holderWidth ? `${holderWidth}px` : 'unset', height: holderHeight ? `${holderHeight}px` : 'unset' }}>
                        <div className='panner' style={{ width: '100%', height: '100%' }} onMouseDown={mouseDown} onTouchStart={mouseDown} onTouchMove={mouseMove} onMouseMove={mouseMove}
                            onMouseUp={() => {
                                checkforPanning()
                                setDraggable(false)
                            }} onMouseLeave={() => {
                                checkforPanning()
                                setDraggable(false)
                            }} onTouchEnd={() => {
                                checkforPanning()
                                setDraggable(false)
                            }}>
                            {draggable && (
                                <div>
                                    <div className="grids">
                                        <div className="grid"/>
                                        <div className="grid"/>
                                    </div>
                                    <div className="grids grids-vert">
                                        <div className="grid"/>
                                        <div className="grid"/>
                                    </div>
                                </div>
                            )}
                            <img className={"step2__image"} src={originalImage.src} alt="" style={{ transform: `translate(${transform[0][0]}px, ${transform[0][1]}px) scale(${transform[1]})`, width: width ? `${width}px` : 'unset', height: height ? `${height}px` : 'unset' }} />
                        </div>
                    </div>
                </div>
                <div className='step2__bottom'>
                    <div className='step2__bottomItem' style={{ backgroundColor: active ? 'transparent' : 'rgba(0,0,0,0.5)' }} onClick={(e) => handleClick(e, 0)}>
                        <div className='step2__bottomV'>
                            <MenuOpen style={{ color: active ? '#282828' : 'white' }} />
                        </div>
                    </div>
                    <div className='step2__bottomItem' style={{ backgroundColor: active ? 'transparent' : 'rgba(0,0,0,0.5)' }} onClick={(e) => handleClick(e, 1)}>
                        <div className='step2__bottomV'>
                            <ZoomIn style={{ color: active ? '#282828' : 'white' }} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Step2;
