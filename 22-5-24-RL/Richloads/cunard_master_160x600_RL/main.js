// 05-2019 ggates //

console.log("Version 2");

var adW = 160,
    adH = 600,
    imgs = [],
    itineraries,
    framesArray = [],
    noFeed = false,


    //IA VARS FOR CAROUSEL FUNCTIONALITY
    slidesArray = [],
    bgArray = [],
    textArray = [],
    navDotsArray = [],
    slideDuration,
    block_click = false,
    block_clickBG = false,
    block_clickText = false,
    killAutoCar = false,
    killBGAutoCar = false,
    killTextAutoCar = false,
    carRotations = 1,
    carTextRotations = 1,
    carBGRotations = 1,
    carousel_speed = .60,
    useA = false,
    ls = adW + "px", //left slide number
    rs = -adW + "px", //right slide number
    useD = false,
    animSpeed = .9,
    slideBg = true,
    fadeBg = false,
    slideText = true,
    fadeText = false,

    useSplash = false,
    useSale = false;

TweenLite.defaultOverwrite = "all";
let cruiseidArray= [];

var Ad = {
    addCommas: function(nStr) {
        nStr += "";
        x = nStr.split(".");
        x1 = x[0];
        x2 = x.length > 1 ? "." + x[1] : "";
        var rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
            x1 = x1.replace(rgx, "$1" + "," + "$2");
        }
        return x1 + x2;
    },
    animate: function() {
        //set up animation type variables
        if (framesArray["data"]["bgAnim"] == "fade") {
            slideBg = false;
            fadeBg = true;
            for (i = 1; i < Ad.byClass("fbg").length; i++) {
                Ad.byClass("fbg")[i].style.opacity = 0;
                Ad.byClass("fbg")[i].style.left = "0px";
            }
        } else {
            slideBg = true;
            fadeBg = false;
        }

        if (framesArray["data"]["textAnim"] == "fade") {
            slideText = false;
            fadeText = true;
            for (i = 1; i < framesArray.data.frameCount; i++) {
                Ad.byClass("head")[i].style.opacity = 0;
                Ad.byClass("head")[i].style.left = "0px";
                Ad.byClass("subhead1")[i].style.opacity = 0;
                Ad.byClass("subhead1")[i].style.left = "0px";
                Ad.byClass("subhead2")[i].style.opacity = 0;
                Ad.byClass("subhead2")[i].style.left = "0px";
            }
        } else {
            slideText = true;
            fadeText = false;
        }
        TweenLite.to(Ad.byId("framesContainer"), 1, { opacity: 1, delay: 0.5 });

        if (useSplash) {
            var splashDelay = 1.5;
            TweenLite.delayedCall(.5, function() {
                splash.style.display = "block";
                splash.style.opacity = 1;
                splash.classList.add("zoomIntro");
                TweenLite.delayedCall(1.7, function() {
                    splash.style.display = "none";
                });
            })
        } else {
            var splashDelay = 0
        }
        // if (useA) {
        if (framesArray.data.frameCount > 1) {
            TweenLite.delayedCall(slideDuration + splashDelay, Ad.autoCarousel);
        }

        // } else if (useD) {
        //DO DOT STUFFS!

        // } else {
        //     //ad is single frame
        // }

    },
    getIA: function(iaName) {
        return myFT.instantAds[iaName];
    },
    byId: function(id) {
        return document.getElementById(id);
    },
    byClass: function(id) {
        return document.getElementsByClassName(id);
    },
    classInId: function(className, id) {
        return document.getElementById(id).getElementsByClassName(className)[0];
    },
    checkMacros: function() {
        function searchMacros(item) {
            for (i = 1; i <= framesArray.data.frameCount; i++) {
                //check all text nodes to for macros
                stringValue = framesArray["f" + i][item];
                //regex to find full macro [%destination1%]
                var macroExtracterRegEx = /\[\%([^]+?)\%\]/g;
                //checks for macro and returns the macros in extractedMacros
                var extractedMacros = stringValue.match(macroExtracterRegEx);
                //associate itin and replace clicktag if there are macros
                if (extractedMacros !== null) {
                    var itinNum = extractedMacros[0].match(/\d+/)[0] - 1;
                    framesArray["f" + i].itinerary = Number(itinNum);

                    // if (framesArray["f" + i]["clickTag"] == "") {
                    //     //check if ? in feed clickthrough URL
                    //     if (itineraries[itinNum].url.indexOf("?") > -1) {
                    //         var retargetingUrl = itineraries[itinNum].url + myFT.get("cidAmp");
                    //     } else {
                    //         var retargetingUrl = itineraries[itinNum].url + myFT.get("cidQuery");
                    //     }
                    //     framesArray["f" + i]["clickTag"] = retargetingUrl;
                    // }
                    
                    //extracts nodename from macro
                    var extractNodeNameReg = /\[\%([^]+)\%\]/;
                    for (a = 0; a < extractedMacros.length; a++) {
                        var extractedNodeName = extractNodeNameReg.exec(extractedMacros[a]);

                        feedNodeName = extractedNodeName[1].replace(/[0-9]/g, '');
                        if (feedNodeName == "price") {
                            //add commas to price node
                            var updatedPrice = Ad.addCommas(itineraries[itinNum]["price"]);
                            var newText = framesArray["f" + i][item].replace(extractedMacros[a], updatedPrice);
                        } else {
                            //18.12.23_ price update test
                            if (feedNodeName == "lowestprice_usdprice"){
                                var usdPrice =  itineraries[itinNum][feedNodeName];
                                var parts = usdPrice.toString().split(".");
                                usdPrice = parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                                //if we ever need to add decimal comment out below line
                                // return parts.join(".");
                                console.log(usdPrice);
                                var newText = framesArray["f" + i][item].replace(extractedMacros[a], usdPrice);
                            }
                            else{
                                var newText = framesArray["f" + i][item].replace(extractedMacros[a], itineraries[itinNum][feedNodeName]);
                            }
                        }
                        framesArray["f" + i][item] = newText;
                    }
                }
            }
        }
        searchMacros("headline");
        searchMacros("subHeadline1");
        searchMacros("subHeadline2");

        //overwrite background images with feed data if they are blank
        for (i = 1; i <= framesArray.data.frameCount; i++) {
            //if the background image is blank use feed
            if (framesArray["f" + i]["itinerary"] !== undefined) {
                if (framesArray["f" + i]["backgroundImg"].indexOf("blank") > -1) {
                    framesArray["f" + i]["backgroundImg"] = itineraries[framesArray["f" + i]["itinerary"]]["image_" + adW + "x" + adH + "_" + (framesArray["f" + i]["itinerary"] + 1)];
                }
            }
        }

        // for (i = 1; i <= framesArray.data.frameCount; i++) {
        //     if (framesArray["f" + 1]["itinerary"] != undefined) {
        //         //if (itineraries[framesArray["f" + 1]["itinerary"]]["salepromo"] != false && framesArray["data"]["ctaSaleTxt"] != "") {
        //         if (itineraries[framesArray["f" + 1]["itinerary"]]["salepromo"] != false) {
        //             //TURN OFF REGULAR CTA
        //             Ad.byId("cta").style.display = "none";
        //             //and set useSale to true per frame
        //             framesArray["f" + i]["useSale"] = true;
        //         }
        //     } else {
        //         framesArray["f" + i]["useSale"] = false;
        //     }
        // }

        //SET MEDALLION TOGGLE
        // for (i = 1; i <= framesArray.data.frameCount; i++) {
        //     if (framesArray["f" + i]["itinerary"] != undefined) {
        //         if (itineraries[Number((framesArray["f" + i]["itinerary"]))]["oceanflag"].indexOf("false") > -1) {
        //             //if itin's medallion is not false set to on. 
        //             framesArray["f" + i]["medallionToggle"] = "off";
        //         } else {
        //             framesArray["f" + i]["medallionToggle"] = "on";
        //         }
        //     } else {
        //         //the current frame will be off for mediallion toggle
        //         framesArray["f" + i]["medallionToggle"] = "off";
        //     }
        // }

        Ad.pushImages();
    },
    findObjectByKey: function(array, key, value, variable) {
        for (var i = 0; i < array.length; i++) {
            if (array[i][key] === value) {
                variable.push(array[i]);
            }
        }
        return null;
    },
    runEllipsis: function(elem) {
        for (i = 1; i <= document.getElementsByClassName(elem).length; i++) {
            for (a = 0; a < document.getElementsByClassName(elem)[i - 1].getElementsByTagName("div").length; a++) {
                if (parseInt(document.getElementsByClassName(elem)[i - 1].getElementsByTagName("div")[a].offsetWidth) > parseInt(document.getElementsByClassName(elem)[i - 1].clientWidth)) {
                    //set beginning variables
                    var currentText = document.getElementsByClassName(elem)[i - 1].getElementsByTagName("div")[a].innerHTML;
                    var newTextArray = currentText.split("");
                    do {
                        // remove end of array and push back to innerhtml with ellipsis
                        newTextArray.pop();
                        var newString = newTextArray.join("");
                        document.getElementsByClassName(elem)[i - 1].getElementsByTagName("div")[a].innerHTML = newString + "...";

                    } while (document.getElementsByClassName(elem)[i - 1].getElementsByTagName("div")[a].offsetWidth > (parseInt(document.getElementsByClassName(elem)[i - 1].clientWidth) - parseInt(document.getElementsByClassName(elem)[i - 1].getElementsByTagName("div")[a].style.left))) {
                        //compares to client width AND left offset.
                    };
                }
            }
        }
    },
    fontResize: function() {
        //max font reduction is 2 pixels, need to ellipsis if longer
        //offset width font resize
//        runResize("head");
        runResize("subhead1");
        runResize("subhead2");

        function runResize(elem) {
            for (i = 1; i <= document.getElementsByClassName(elem).length; i++) {
                for (a = 0; a < document.getElementsByClassName(elem)[i - 1].getElementsByTagName("div").length; a++) {

                    if (parseInt(document.getElementsByClassName(elem)[i - 1].getElementsByTagName("div")[a].offsetWidth) > parseInt(document.getElementsByClassName(elem)[i - 1].clientWidth)) {
                        var startingFontSize = parseInt(document.getElementsByClassName(elem)[i - 1].getElementsByTagName("div")[a].style.fontSize);
                        
//                        if(elem != "head"){ // only run if subheadline
//                            console.log("Head!")
                            var newFontSize = startingFontSize;
                            do {
                                document.getElementsByClassName(elem)[i - 1].getElementsByTagName("div")[a].style.fontSize = newFontSize + "px";
                                newFontSize--;
                                if (newFontSize == startingFontSize - 3) {
                                    //only allowed to go down two pixels so break loop
                                    break;
                                }

                            } while (document.getElementsByClassName(elem)[i - 1].getElementsByTagName("div")[a].offsetWidth > parseInt(document.getElementsByClassName(elem)[i - 1].clientWidth)) {};

//                        }
                    }
                }
            }
            Ad.runEllipsis(elem);
        }

        Ad.animate();
    },
    legalClick: function() {
        myFT.tracker('legalCta_click', '');

        Ad.byId("legalOverlayClose").addEventListener("click", function() {
            TweenLite.to(Ad.byId("legalOverlay"), carousel_speed, { top: adH + "px" });
        });
        TweenLite.to(Ad.byId("legalOverlay"), carousel_speed, { top: 0 });
    },
    overlayHover: function() {
        myFT.tracker('ocean_medallion_hover', '');

        Ad.byId("medallionOverlayClose").addEventListener("click", function(el) {
            el.stopImmediatePropagation();
            myFT.tracker('ocean_medallion_overlay_close_click', '');
            TweenLite.to(Ad.byId("medallionOverlay"), carousel_speed, { bottom: -adW + "px" });
        });
        TweenLite.to(Ad.byId("medallionOverlay"), carousel_speed, { bottom: 0 });
    },
    lg: function(msg) {
        if (window.console) {
            console.log(msg);
        }
    },
    loadFeed: function(feedItems, feedUrl) {
        console.log("feedloaded");
        Ad.lg(feedItems);
        Ad.lg(feedUrl);
        //STATECALL TRACKING
        var productArray = [];
        for (var i = 0; i < feedItems.length; i++) {
            var itinArray = [];
            cruiseidArray.push(feedItems[i].cruiseid);
            itinArray.push(feedItems[i]._id, feedItems[i].name, feedItems[i].price, feedItems[i].oceanflag);
            productArray.push(itinArray);
        }
        var allProducts = productArray.join("|");
        //Fire a "state" call
        Tracker.impressionTrackEvent(allProducts, 'ft_product', false);
        itineraries = feedItems;

        Ad.checkMacros();
    },
    feedLoadError: function() {
        //this is what happens when feed dies
        var newBackupImage = new Image();
        newBackupImage.src = framesArray["data"]["failsafeImg"];
        Ad.classInId("fbg", "f1").appendChild(newBackupImage);
        myFT.applyClickTag(Ad.classInId("click", "f1"), 1, framesArray["data"]["failsafeClickTag"]);
        TweenLite.to(Ad.byId("framesContainer"), carousel_speed, { opacity: 1, delay: .5 });
    },
    autoCarousel: function() {
        if (!killAutoCar && !killBGAutoCar && !killTextAutoCar) {
            Ad.onArrowClick("autoCarousel");
            Ad.onArrowClickBg("autoCarousel");
            Ad.onArrowClickText("autoCarousel");
        }
    },
    prevClick: function() {
        if (useA) {
            myFT.tracker('left_arrow_click', '');
        }

        Ad.onArrowClick("left_arrow");
        Ad.onArrowClickBg("left_arrow");
        Ad.onArrowClickText("left_arrow");
    },
    nextClick: function() {
        if (useA) {
            myFT.tracker('right_arrow_click', '');
        }
        Ad.onArrowClick("right_arrow");
        Ad.onArrowClickBg("right_arrow");
        Ad.onArrowClickText("right_arrow");
    },
    resetBlock: function() {
        block_click = false;
    },
    resetBlockBG: function() {
        block_clickBG = false;
    },
    resetBlockText: function() {
        block_clickText = false;
    },
    mobileAndTabletcheck: function() {
        (function(a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) useD = true; })(navigator.userAgent || navigator.vendor || window.opera);
    },
    detectSwipe: function(el, func) {
        swipe_det = new Object();
        swipe_det.sX = 0;
        swipe_det.sY = 0;
        swipe_det.eX = 0;
        swipe_det.eY = 0;
        var min_x = 30; //min x swipe for horizontal swipe
        var max_x = 30; //max x difference for vertical swipe
        var min_y = 50; //min y swipe for vertical swipe
        var max_y = 60; //max y difference for horizontal swipe
        var direc = "";
        ele = document.getElementById(el);
        ele.addEventListener('touchstart', function(e) {
            var t = e.touches[0];
            swipe_det.sX = t.screenX;
            swipe_det.sY = t.screenY;
        }, false);
        ele.addEventListener('touchmove', function(e) {
            e.preventDefault();
            var t = e.touches[0];
            swipe_det.eX = t.screenX;
            swipe_det.eY = t.screenY;
        }, false);
        ele.addEventListener('touchend', function(e) {
            //horizontal detection
            if ((((swipe_det.eX - min_x > swipe_det.sX) || (swipe_det.eX + min_x < swipe_det.sX)) && ((swipe_det.eY < swipe_det.sY + max_y) && (swipe_det.sY > swipe_det.eY - max_y) && (swipe_det.eX > 0)))) {
                if (swipe_det.eX > swipe_det.sX) direc = "r";
                else direc = "l";
            }
            //vertical detection
            else if ((((swipe_det.eY - min_y > swipe_det.sY) || (swipe_det.eY + min_y < swipe_det.sY)) && ((swipe_det.eX < swipe_det.sX + max_x) && (swipe_det.sX > swipe_det.eX - max_x) && (swipe_det.eY > 0)))) {
                if (swipe_det.eY > swipe_det.sY) direc = "d";
                else direc = "u";
            }

            // if (direc != "") {
            //     if (typeof func == 'function') func(el, direc);
            // }
            if (direc == "l") {
                myFT.tracker('left_swipe', '');
                Ad.nextClick();
            }
            if (direc == "r") {
                myFT.tracker('right_swipe', '');
                Ad.prevClick();
            }
            direc = "";
            swipe_det.sX = 0;
            swipe_det.sY = 0;
            swipe_det.eX = 0;
            swipe_det.eY = 0;
        }, false);
    },
    onArrowClick: function(origin) {
        var event_name,
            newID;
        if (origin === 'autoCarousel') {
            newID = slidesArray[1];
            carRotations++;
        } else {
            event_name = origin;
            newID = slidesArray[0];
            killAutoCar = true;
        }
        var elm, //element to slide out
            elm2, //element to slide in
            ls = adW + "px", //left slide number
            rs = -adW + "px"; //right slide number
        if (!block_click && parseInt(newID) != parseInt(slidesArray[0])) {
            block_click = true;
            if (event_name == 'right_arrow' || origin === "autoCarousel") {
                //DISPLAY ARROWS FOR 3s ON END OF CAROUSEL AUTO ROTATION
                if (carRotations == framesArray.data.frameCount && origin === "autoCarousel") {
                    killAutoCar = true;
                    if (useA) {
                        TweenLite.to(Ad.byId("arrows"), .01, { opacity: 1, delay: .5 });
                        TweenLite.to(Ad.byId("left_arrow"), .01, { opacity: 1, delay: .8 });
                        TweenLite.to(Ad.byId("right_arrow"), .01, { opacity: 1, delay: .8 });
                        setTimeout(function() {
                            TweenLite.to(Ad.byId("arrows"), .01, { opacity: 0 });
                            TweenLite.to(Ad.byId("left_arrow"), .01, { opacity: 0 });
                            TweenLite.to(Ad.byId("right_arrow"), .01, { opacity: 0 });
                        }, 3700);
                    }
                }
                //ELM IS THE INACTIVE OR LEAVING SLIDE HERE
                elm = slidesArray[0];
                Ad.classInId("click", elm).style.display = "none";
                if (useD) {
                    byeDot = navDotsArray[0];
                    Ad.byClass("dot")[byeDot].style.backgroundColor = "#88949f";
                    byeDot = navDotsArray.shift();
                    navDotsArray.push(byeDot);
                    hiDot = navDotsArray[0];
                    Ad.byClass("dot")[hiDot].style.backgroundColor = "#FFFFFF";
                }

                elm = slidesArray.shift();

                slidesArray.push(elm);

                //ELM2 is ACTIVE SLIDE!
                elm2 = slidesArray[0];


                
                //TOGGLE ITEMS
                //LOGO TOGGLE
                if (framesArray[elm2]["logoToggle"] == "off") {
                    TweenLite.to(Ad.byId("logo1"), carousel_speed, { opacity: 0 });
                } else if (framesArray[elm2]["logoToggle"] == "on") {
                    TweenLite.to(Ad.byId("logo1"), carousel_speed, { opacity: 1 });
                }
                //LOGO2 TOGGLE
                if (framesArray[elm2]["logo2Toggle"] == "off") {
                    TweenLite.to(Ad.byId("logo2"), carousel_speed, { opacity: 0 });
                } else if (framesArray[elm2]["logo2Toggle"] == "on") {
                    TweenLite.to(Ad.byId("logo2"), carousel_speed, { opacity: 1 });
                }
                //CTA TOGGLE
                useSale = framesArray[elm2]["useSale"];
                if (!useSale) {
                    if (framesArray[elm2]["ctaToggle"] == "off") {
                        TweenLite.to(Ad.byId("cta"), carousel_speed, { opacity: 0, display: "none" });
                    } else if (framesArray[elm2]["ctaToggle"] == "on") {
                        TweenLite.to(Ad.byId("cta"), carousel_speed, { opacity: 1, display: "block" });
                    }
                }

                //SALE CTA TOGGLE
                if (framesArray[elm2]["ctaSaleToggle"] == "off") {
                    TweenLite.to(Ad.byId("ctaSale"), carousel_speed, { opacity: 0, display: "none" });
                } else if (framesArray[elm2]["ctaSaleToggle"] == "on") {
                    TweenLite.to(Ad.byId("ctaSale"), carousel_speed, { opacity: 1, display: "block" });
                }
                //LEGAL TOGGLE
                if (framesArray[elm2]["legalToggle"] == "off") {
                    TweenLite.to(Ad.byId("ctaLegal"), carousel_speed, { opacity: 0, display: "none" });
                    if (framesArray.data.legalOverlayTxt != "") {
                        Ad.byId("ctaLegal").removeEventListener("click", Ad.legalClick);
                    }
                } else if (framesArray[elm2]["legalToggle"] == "on") {
                    Ad.byId("ctaLegal").style.left = framesArray[elm2]["legalX"] + "px";
                    Ad.byId("ctaLegal").style.top = framesArray[elm2]["legalY"] + "px";
                    TweenLite.to(Ad.byId("ctaLegal"), carousel_speed, { opacity: 1, display: "block" });
                    if (framesArray.data.legalOverlayTxt != "") {
                        Ad.byId("ctaLegal").addEventListener("click", Ad.legalClick)
                    }
                }
                //MEDALLION TOGGLE
                if (framesArray[elm2]["medallionToggle"] == "off") {
                    TweenLite.to(Ad.byId("ctaMedallion"), carousel_speed, { opacity: 0, display: "none" });
                    Ad.byId("ctaMedallion").removeEventListener("mouseover", Ad.overlayHover);
                } else if (framesArray[elm2]["medallionToggle"] == "on") {
                    TweenLite.to(Ad.byId("ctaMedallion"), carousel_speed, { opacity: 1, display: "block" });
                    Ad.byId("ctaMedallion").addEventListener("mouseover", Ad.overlayHover);
                }
                Ad.classInId("click", elm2).style.display = "block";
                Ad.resetBlock();
            } else {
                //ELM IS PREVIOUS/INACTIVE SLIDE
                elm = slidesArray[0];
                Ad.classInId("click", elm).style.display = "none";
                if (useD) {
                    byeDot = navDotsArray[0];
                    Ad.byClass("dot")[byeDot].style.backgroundColor = "#88949f";
                    hiDot = navDotsArray.pop();
                    Ad.byClass("dot")[hiDot].style.backgroundColor = "#FFFFFF";
                    navDotsArray.unshift(hiDot);
                }

                //ELM2 IS CURRENT/ACTIVE SLIDE
                elm2 = slidesArray.pop();


                //TOGGLE ITEMS
                //LOGO TOGGLE
                if (framesArray[elm2]["logoToggle"] == "off") {
                    TweenLite.to(Ad.byId("logo1"), carousel_speed, { opacity: 0 });
                } else if (framesArray[elm2]["logoToggle"] == "on") {
                    TweenLite.to(Ad.byId("logo1"), carousel_speed, { opacity: 1 });
                }
                //LOGO2 TOGGLE
                if (framesArray[elm2]["logo2Toggle"] == "off") {
                    TweenLite.to(Ad.byId("logo2"), carousel_speed, { opacity: 0 });
                } else if (framesArray[elm2]["logo2Toggle"] == "on") {
                    TweenLite.to(Ad.byId("logo2"), carousel_speed, { opacity: 1 });
                }
                //CTA TOGGLE
                useSale = framesArray[elm2]["useSale"];
                if (!useSale) {
                    if (framesArray[elm2]["ctaToggle"] == "off") {
                        TweenLite.to(Ad.byId("cta"), carousel_speed, { opacity: 0, display: "none" });
                    } else if (framesArray[elm2]["ctaToggle"] == "on") {
                        TweenLite.to(Ad.byId("cta"), carousel_speed, { opacity: 1, display: "block" });
                    }
                }
                //CTA SALE TOGGLE
                if (framesArray[elm2]["ctaSaleToggle"] == "off") {
                    TweenLite.to(Ad.byId("ctaSale"), carousel_speed, { opacity: 0, display: "none" });
                } else if (framesArray[elm2]["ctaSaleToggle"] == "on") {
                    TweenLite.to(Ad.byId("ctaSale"), carousel_speed, { opacity: 1, display: "block" });
                }
                //LEGAL TOGGLE
                if (framesArray[elm2]["legalToggle"] == "off") {
                    TweenLite.to(Ad.byId("ctaLegal"), carousel_speed, { opacity: 0, display: "none" });
                    if (framesArray.data.legalOverlayTxt != "") {
                        Ad.byId("ctaLegal").removeEventListener("click", Ad.legalClick);
                    }
                } else if (framesArray[elm2]["legalToggle"] == "on") {
                    Ad.byId("ctaLegal").style.left = framesArray[elm2]["legalX"] + "px";
                    Ad.byId("ctaLegal").style.top = framesArray[elm2]["legalY"] + "px";
                    TweenLite.to(Ad.byId("ctaLegal"), carousel_speed, { opacity: 1, display: "block" });
                    if (framesArray.data.legalOverlayTxt != "") {
                        Ad.byId("ctaLegal").addEventListener("click", Ad.legalClick);
                    }
                }
                //MEDALLION TOGGLE
                if (framesArray[elm2]["medallionToggle"] == "off") {
                    TweenLite.to(Ad.byId("ctaMedallion"), carousel_speed, { opacity: 0, display: "none" });
                    Ad.byId("ctaMedallion").removeEventListener("mouseover", Ad.overlayHover);
                } else if (framesArray[elm2]["medallionToggle"] == "on") {
                    TweenLite.to(Ad.byId("ctaMedallion"), carousel_speed, { opacity: 1, display: "block" });
                    Ad.byId("ctaMedallion").addEventListener("mouseover", Ad.overlayHover);
                }
                Ad.classInId("click", elm2).style.display = "block";
                slidesArray.unshift(elm2);
                Ad.resetBlock();

            }
            if (!killAutoCar && parseInt(slidesArray[0]) != "0") {
                TweenLite.delayedCall(slideDuration, Ad.autoCarousel);
            }
        }
    },
    onArrowClickBg: function(origin) {
        var event_name,
            newID;
        if (origin === 'autoCarousel') {
            newID = bgArray[1];
            carBGRotations++;
        } else {
            event_name = origin;
            newID = bgArray[0];
            killBGAutoCar = true;
        }
        var elm, //element to slide out
            elm2, //element to slide in
            ls = adW + "px", //left slide number
            rs = -adW + "px"; //right slide number
        if (!block_clickBG) {
            block_clickBG = true;
            if (event_name == 'right_arrow' || origin === "autoCarousel") {
                if (carBGRotations == framesArray.data.frameCount && origin === "autoCarousel") {
                    killBGAutoCar = true;
                }
                //ELM IS THE INACTIVE OR LEAVING SLIDE HERE
                elm = bgArray[0];
                //BACKGROUND ANIMATIONS
                if (elm != bgArray[1]) {
                    if (slideBg) {
                        TweenLite.to(Ad.classInId("fbg", elm), carousel_speed, { left: rs });
                    }
                    if (fadeBg) {
                        TweenLite.to(Ad.classInId("fbg", elm), carousel_speed, { opacity: 0 });
                    }
                }
                elm = bgArray.shift();
                bgArray.push(elm);
                //ELM2 is ACTIVE SLIDE!
                elm2 = bgArray[0];
                if (elm2 != elm) {
                    if (slideBg) {
                        Ad.classInId("fbg", elm2).style.left = ls;
                        TweenLite.to(Ad.classInId("fbg", elm2), carousel_speed, { left: "0px" });
                    }
                    if (fadeBg) {
                        Ad.classInId("fbg", elm2).style.opacity = 0;
                        TweenLite.to(Ad.classInId("fbg", elm2), carousel_speed, { opacity: 1 });
                    }
                }
                Ad.resetBlockBG();
            } else {
                //ELM IS PREVIOUS/INACTIVE SLIDE
                elm = bgArray[0];
                //BACKGROUND ANIMATIONS
                if (elm != bgArray[bgArray.length - 1]) {
                    if (slideBg) {
                        TweenLite.to(Ad.classInId("fbg", elm), carousel_speed, { left: ls });
                    }
                    if (fadeBg) {
                        TweenLite.to(Ad.classInId("fbg", elm), carousel_speed, { opacity: 0 });
                    }
                }
                //ELM2 IS CURRENT/ACTIVE SLIDE
                elm2 = bgArray.pop();
                //BACKGROUND ANIMATIONS
                if (elm2 != elm) {
                    if (slideBg) {
                        Ad.classInId("fbg", elm2).style.left = rs;
                        TweenLite.to(Ad.classInId("fbg", elm2), carousel_speed, { left: "0px" });
                    }
                    if (fadeBg) {
                        Ad.classInId("fbg", elm2).style.opacity = 0;
                        TweenLite.to(Ad.classInId("fbg", elm2), carousel_speed, { opacity: 1 });
                    }
                }
                Ad.resetBlockBG();
                bgArray.unshift(elm2);
            }
        }
    },
    onArrowClickText: function(origin) {
        var event_name,
            newID;
        if (origin === 'autoCarousel') {
            newID = textArray[1];
            carTextRotations++;
        } else {
            event_name = origin;
            newID = textArray[0];
            killTextAutoCar = true;
        }
        var elm, //element to slide out
            elm2, //element to slide in
            ls = adW + "px", //left slide number
            rs = -adW + "px"; //right slide number
        if (!block_clickText) {
            block_clickText = true;
            if (event_name == 'right_arrow' || origin === "autoCarousel") {
                if (carTextRotations == framesArray.data.frameCount && origin === "autoCarousel") {
                    killTextAutoCar = true;
                }
                //ELM IS THE INACTIVE OR LEAVING SLIDE HERE
                elm = textArray[0];
                // //TEXT ANIMATIONS
                if (elm != textArray[1]) {
                    if (slideText) {
                        TweenLite.to(Ad.classInId("head", elm), carousel_speed, { left: rs });
                        TweenLite.to(Ad.classInId("subhead1", elm), carousel_speed, { left: rs });
                        TweenLite.to(Ad.classInId("subhead2", elm), carousel_speed, { left: rs });
                    }
                    if (fadeText) {
                        TweenLite.to(Ad.classInId("head", elm), carousel_speed, { opacity: 0 });
                        TweenLite.to(Ad.classInId("subhead1", elm), carousel_speed, { opacity: 0 });
                        TweenLite.to(Ad.classInId("subhead2", elm), carousel_speed, { opacity: 0 });
                    }
                }
                elm = textArray.shift();
                textArray.push(elm);
                //ELM2 is ACTIVE SLIDE!
                elm2 = textArray[0];
                if (elm2 != elm) {
                    //TEXT ANIMATIONS
                    if (slideText) {
                        Ad.classInId("head", elm2).style.left = ls;
                        Ad.classInId("subhead1", elm2).style.left = ls;
                        Ad.classInId("subhead2", elm2).style.left = ls;
                        TweenLite.to(Ad.classInId("head", elm2), carousel_speed, { left: "0px" });
                        TweenLite.to(Ad.classInId("subhead1", elm2), carousel_speed, { left: "0px" });
                        TweenLite.to(Ad.classInId("subhead2", elm2), carousel_speed, { left: "0px" });
                    }
                    if (fadeText) {
                        TweenLite.to(Ad.classInId("head", elm2), carousel_speed, { opacity: 1, delay: carousel_speed });
                        TweenLite.to(Ad.classInId("subhead1", elm2), carousel_speed, { opacity: 1, delay: carousel_speed });
                        TweenLite.to(Ad.classInId("subhead2", elm2), carousel_speed, { opacity: 1, delay: carousel_speed });
                    }
                }
                Ad.resetBlockText();
            } else {
                //ELM IS PREVIOUS/INACTIVE SLIDE
                elm = textArray[0];
                //TEXT ANIMATIONS
                if (elm != textArray[textArray.length - 1]) {
                    //TEXT ANIMATIONS
                    if (slideText) {
                        TweenLite.to(Ad.classInId("head", elm), carousel_speed, { left: ls });
                        TweenLite.to(Ad.classInId("subhead1", elm), carousel_speed, { left: ls });
                        TweenLite.to(Ad.classInId("subhead2", elm), carousel_speed, { left: ls });
                    }
                    if (fadeText) {
                        TweenLite.to(Ad.classInId("head", elm), carousel_speed, { opacity: 0 });
                        TweenLite.to(Ad.classInId("subhead1", elm), carousel_speed, { opacity: 0 });
                        TweenLite.to(Ad.classInId("subhead2", elm), carousel_speed, { opacity: 0 });
                    }
                }
                //ELM2 IS CURRENT/ACTIVE SLIDE
                elm2 = textArray.pop();
                //TEXT ANIMATIONS
                if (elm2 != elm) {
                    //TEXT ANIMATIONS
                    if (slideText) {
                        Ad.classInId("head", elm2).style.left = rs;
                        Ad.classInId("subhead1", elm2).style.left = rs;
                        Ad.classInId("subhead2", elm2).style.left = rs;
                        TweenLite.to(Ad.classInId("head", elm2), carousel_speed, { left: "0px" });
                        TweenLite.to(Ad.classInId("subhead1", elm2), carousel_speed, { left: "0px" });
                        TweenLite.to(Ad.classInId("subhead2", elm2), carousel_speed, { left: "0px" });
                    }
                    if (fadeText) {
                        TweenLite.to(Ad.classInId("head", elm2), carousel_speed, { opacity: 1, delay: carousel_speed });
                        TweenLite.to(Ad.classInId("subhead1", elm2), carousel_speed, { opacity: 1, delay: carousel_speed });
                        TweenLite.to(Ad.classInId("subhead2", elm2), carousel_speed, { opacity: 1, delay: carousel_speed });
                    }
                }
                Ad.resetBlockText();
                textArray.unshift(elm2);
            }
        }
    },
    loadImages: function(imgs) {
        var tmpCnt = 0;
        for (var i = 0; i < imgs.length; i++) {
            var newImg = new Image();
            newImg.src = imgs[i];
            newImg.addEventListener('load', function() {
                tmpCnt++;
                if (tmpCnt == imgs.length) {
                    Ad.build();
                }
            });
            newImg.addEventListener('error', function(e) {
                e.target.src = "images/blank.png";
            });
        }
    },
    pushImages: function() {
        // imgs.push(framesArray["data"]["failsafeImg"], framesArray["data"]["splashImg"], framesArray["data"]["logoImg"], framesArray["data"]["logo2Img"], framesArray["data"]["oceanMedallionImg"], framesArray["data"]["ctaIconImg"]);
        imgs.push(framesArray["data"]["failsafeImg"], framesArray["data"]["logoImg"], framesArray["data"]["logo2Img"]);
        for (i = 1; i <= framesArray.data.frameCount; i++) {
            imgs.push(framesArray["f" + i]["backgroundImg"])
        };
        Ad.loadImages(imgs);
    },
    hexToRgbA: function(hex, bgOp) {
        var c;
        if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
            c = hex.substring(1).split('');
            if (c.length == 3) {
                c = [c[0], c[0], c[1], c[1], c[2], c[2]];
            }
            c = '0x' + c.join('');
            return 'rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + ',' + bgOp + ')';
        }
        throw new Error('Bad Hex');
    },
    xySplitter: function xySplitter(values) {
        values = values.split(",");
        return values;
    },
    toggleSplitter: function(values) {
        values = values.split("|");
        return values;
    },
    xyUpdater: function(iaName, targetDiv) {
        if (Ad.getIA(iaName) !== "") {
            var coord = Ad.xySplitter(Ad.getIA(iaName));
            targetDiv.classList.remove("center");
            targetDiv.classList.remove(concept);
            targetDiv.classList.remove("defaultWidth");
            targetDiv.style.left = coord[0] + "px";
            targetDiv.style.top = coord[1] + "px";
        }
    },
    urlBuilder: function(urlToUpdate) {
        var url = urlToUpdate;
        url = url.replace("[%FT_SITE_ID%]", myFT.get('siteID'));
        url = url.replace("[%FT_CREATIVE_ID%]", myFT.get('creativeID'));
        url = url.replace("[%FT_PLACEMENT_ID%]", myFT.get('pID'));
        url = url.replace("[%FT_WIDTH%]", myFT.get("maxWidth"));
        url = url.replace("[%FT_HEIGHT%]", myFT.get("maxHeight"));
        url = url.replace("[%FT_CONFIGURATION_ID%]", myFT.get("ftConfID"));
        var encodeLoop = myFT.get('ampEncCount');
        var ampEncode = "&";
        for (encodeLoop; encodeLoop > 0; encodeLoop--) {
            ampEncode = encodeURIComponent(ampEncode);
        };
        var find = '&';
        var re = new RegExp(find, 'g');
        url = url.replace(re, ampEncode);
        // myFT.clickTag(1, url);

        //add custom site analytics to IA urls
        if(url){
            if (url.indexOf("?") > -1) {
                url = url + myFT.get("cidAmp");
            } else {
                url = url + myFT.get("cidQuery");
            }
        }
        return url;
    },
    init: function() {
        //BUILD MAIN CREATIVE DATA ARRAY
        framesArray["data"] = {
            //splashToggle: myFT.instantAds.splashToggle,
            // splashImg: myFT.instantAds.splash_img,
            frameCount: myFT.instantAds.frameCount,
            frameDelay: myFT.instantAds.frameDelay,
            textAnim: Ad.toggleSplitter(myFT.instantAds.text_bkgd_AnimationType)[0],
            bgAnim: Ad.toggleSplitter(myFT.instantAds.text_bkgd_AnimationType)[1],
            failsafeImg: myFT.instantAds.failsafe_img,
            // failsafeClickTag: Ad.urlBuilder(Ad.getIA("failSafeURL")),
            failsafeClickTag: Ad.urlBuilder(Ad.getIA("clickTag5_url")),

            // ctaIconImg: Ad.getIA("ctaIcon_img"),
            ctaTxt: Ad.getIA("cta_txt"),
            ctaTxtSize: Ad.xySplitter(Ad.getIA("ctaTxt_size_hex_hexHov"))[0],
            ctaTxtHex: Ad.xySplitter(Ad.getIA("ctaTxt_size_hex_hexHov"))[1],
            ctaTxtHexHov: Ad.xySplitter(Ad.getIA("ctaTxt_size_hex_hexHov"))[2],
            ctaBtnBorderHex: Ad.xySplitter(Ad.getIA("ctaBtnBorder_hex_hexHov"))[0],
            ctaBtnBorderHexHov: Ad.xySplitter(Ad.getIA("ctaBtnBorder_hex_hexHov"))[1],

            ctaBtnHex: Ad.xySplitter(Ad.getIA("ctaBtn_hex_hexHov_xy"))[0],
            ctaBtnHexHov: Ad.xySplitter(Ad.getIA("ctaBtn_hex_hexHov_xy"))[1],
            ctaBtnX: Ad.xySplitter(Ad.getIA("ctaBtn_hex_hexHov_xy"))[2],
            ctaBtnY: Ad.xySplitter(Ad.getIA("ctaBtn_hex_hexHov_xy"))[3],
            //ctaSaleTxt: Ad.getIA("cta_sale_txt"),

            legalTxt: Ad.getIA("legalCta_txt"),
            legalSize: Ad.toggleSplitter(Ad.getIA("legalCtaTxt_size_hex_F1xy_F2xy_F3xy_F4xy"))[0],
            legalHex: Ad.toggleSplitter(Ad.getIA("legalCtaTxt_size_hex_F1xy_F2xy_F3xy_F4xy"))[1],
            legalOverlayTxt: Ad.getIA("legalOverlay_txt"),
            legalOverlaySize: Ad.toggleSplitter(Ad.getIA("legalOverlayTxt_size_hex"))[0],
            legalOverlayHex: Ad.toggleSplitter(Ad.getIA("legalOverlayTxt_size_hex"))[1],


            logoImg: Ad.getIA("logo_img"),
            logoImgX: Ad.xySplitter(Ad.getIA("logo_img_xy"))[0],
            logoImgY: Ad.xySplitter(Ad.getIA("logo_img_xy"))[1],

            logo2Img: Ad.getIA("logo2_img"),
            logo2ImgX: Ad.xySplitter(Ad.getIA("logo2_img_xy"))[0],
            logo2ImgY: Ad.xySplitter(Ad.getIA("logo2_img_xy"))[1],

            //oceanMedallionImg: Ad.getIA("oceanMedallion_img"),
            //oceanMedallionOverlayTxt: Ad.getIA("oceanMedallionOverlay_txt"),
            // oceanMedallionTxtSize: Ad.xySplitter(Ad.getIA("oceanMedallionOverlayTxt_size_hex_bgHex_bgOpacity"))[0],
            // oceanMedallionTxtHex: Ad.xySplitter(Ad.getIA("oceanMedallionOverlayTxt_size_hex_bgHex_bgOpacity"))[1],
            // oceanMedallionTxtbgHex: Ad.xySplitter(Ad.getIA("oceanMedallionOverlayTxt_size_hex_bgHex_bgOpacity"))[2],
            // oceanMedallionTxtbgOpacity: Ad.xySplitter(Ad.getIA("oceanMedallionOverlayTxt_size_hex_bgHex_bgOpacity"))[3],

            leftArrow: Ad.toggleSplitter(Ad.getIA("arrows_txt"))[0],
            rightArrow: Ad.toggleSplitter(Ad.getIA("arrows_txt"))[1],
            arrowsSize: Ad.xySplitter(Ad.getIA("arrowsTxt_size_hex_bgHex_bgOpacity"))[0],
            arrowsHex: Ad.xySplitter(Ad.getIA("arrowsTxt_size_hex_bgHex_bgOpacity"))[1],
            arrowsBgHex: Ad.xySplitter(Ad.getIA("arrowsTxt_size_hex_bgHex_bgOpacity"))[2],
            arrowsBgOpacity: Ad.xySplitter(Ad.getIA("arrowsTxt_size_hex_bgHex_bgOpacity"))[3],

            // dotsActiveHex: Ad.xySplitter(Ad.getIA("dots_activeHex_selectHex_xy"))[0],
            // dotsSelectHex: Ad.xySplitter(Ad.getIA("dots_activeHex_selectHex_xy"))[1],
            // dotsActiveX: Ad.xySplitter(Ad.xySplitter(Ad.getIA("dots_activeHex_selectHex_xy"))[2])[0],
            // dotsActiveY: Ad.xySplitter(Ad.xySplitter(Ad.getIA("dots_activeHex_selectHex_xy"))[2])[1]
        };

        //builds frame data from ia vars
        for (var i = 1; i <= framesArray.data.frameCount; i++) {
            //create slides array that references frame id
            slidesArray.push("f" + i);
            bgArray.push("f" + i);
            textArray.push("f" + i);
            //FRAME DATA
            var iaTempObj = new Object();
            iaTempObj.frameDiv = "f" + i;
            iaTempObj.backgroundImg = Ad.getIA("F" + i + "_bkgd_img");

            iaTempObj.headline = Ad.getIA("F" + i + "_headline_txt");
            iaTempObj.headlineData = Ad.xySplitter(Ad.getIA("F" + i + "_headlineTxt_size_hex_xy"));
            iaTempObj.headlineSize = iaTempObj.headlineData[0];
            iaTempObj.headlineHex = iaTempObj.headlineData[1];
            iaTempObj.headlineX = iaTempObj.headlineData[2];
            iaTempObj.headlineY = iaTempObj.headlineData[3];
            iaTempObj.headlineExtra = [];
            for (let index = 4; index < iaTempObj.headlineData.length; index++) {
                iaTempObj.headlineExtra.push(iaTempObj.headlineData[index])
                console.log(iaTempObj.headlineData[index]);
            }

            iaTempObj.subHeadline1 = Ad.getIA("F" + i + "_subHeadline1_txt");

            iaTempObj.subHeadline1Data = Ad.xySplitter(Ad.getIA("F" + i + "_subHeadline1Txt_size_hex_xy"));
            iaTempObj.subHeadline1Size = iaTempObj.subHeadline1Data[0];
            iaTempObj.subHeadline1Hex = iaTempObj.subHeadline1Data[1];
            iaTempObj.subHeadline1X = iaTempObj.subHeadline1Data[2];
            iaTempObj.subHeadline1Y = iaTempObj.subHeadline1Data[3];
            iaTempObj.subHeadline1Extra = []
            for (let index = 4; index < iaTempObj.subHeadline1Data.length; index++) {
                iaTempObj.subHeadline1Extra.push(iaTempObj.subHeadline1Data[index])
                console.log(iaTempObj.subHeadline1Data[index]);
            }

            iaTempObj.subHeadline2 = Ad.getIA("F" + i + "_subHeadline2_txt");
            iaTempObj.subHeadline2Data = Ad.xySplitter(Ad.getIA("F" + i + "_subHeadline2Txt_size_hex_xy"));
            iaTempObj.subHeadline2Size = iaTempObj.subHeadline2Data[0];
            iaTempObj.subHeadline2Hex = iaTempObj.subHeadline2Data[1];
            iaTempObj.subHeadline2X = iaTempObj.subHeadline2Data[2];
            iaTempObj.subHeadline2Y = iaTempObj.subHeadline2Data[3];
            iaTempObj.subHeadline2Extra = [];
            for (let index = 4; index < iaTempObj.subHeadline2Data.length; index++) {
                iaTempObj.subHeadline2Extra.push(iaTempObj.subHeadline2Data[index])
                console.log(iaTempObj.subHeadline2Data[index]);
            }
            iaTempObj.legalToggle = Ad.toggleSplitter(Ad.getIA("legalCtaTxt_toggle"))[i - 1];

            iaTempObj.legalData = Ad.toggleSplitter(Ad.getIA("legalCtaTxt_size_hex_F1xy_F2xy_F3xy_F4xy"));

            iaTempObj.legalX = Ad.xySplitter(iaTempObj.legalData[i + 1])[0];
            iaTempObj.legalY = Ad.xySplitter(iaTempObj.legalData[i + 1])[1];
            iaTempObj.ctaToggle = Ad.toggleSplitter(Ad.getIA("cta_toggle"))[i - 1];
            //iaTempObj.ctaSaleToggle = Ad.toggleSplitter(Ad.getIA("ctaSale_toggle"))[i - 1];

            iaTempObj.logoToggle = Ad.toggleSplitter(Ad.getIA("logo_toggle"))[i - 1];
            iaTempObj.logo2Toggle = Ad.toggleSplitter(Ad.getIA("logo2_toggle"))[i - 1];

            // iaTempObj.clickTag = Ad.urlBuilder(Ad.getIA("F" + i + "_clickTag"));
            iaTempObj.clickTag = Ad.urlBuilder(Ad.getIA(`clickTag${i}_url`));

            if(i != 2){
                iaTempObj.clickTag = Ad.urlBuilder(Ad.getIA("clickTag" + i + "_url"));
            }else {
                setTimeout(() => {
                    const link =myFT.instantAds.clickTag2_url+cruiseidArray[0]+'/'+cruiseidArray[0];
                    // console.log(link);
                    // console.log(cruiseidArray.length);
                    iaTempObj.clickTag = Ad.urlBuilder(link);   
                }, 1500);
                
            }
            framesArray["f" + i] = iaTempObj;
        }

        //SPLASH TOGGLE
        //TODO: CHANGE TO SPLASH IA VAR
        // if (framesArray.data.splashToggle == "on") {
        //     useSplash = true;
        //    splash.style.background = "transparent url('" + framesArray.data.splashImg + "') 0 0 no-repeat";
        // }

        //checks for mobile and changes useD to true
        if (framesArray.data.frameCount > 1) {
            Ad.mobileAndTabletcheck();
        }

        //SHOW ARROWS IF MORE THAN ONE FRAME
        if (framesArray.data.frameCount > 1 && !useD) {
            useA = true;
        }

        //CHECK FOR FEED ENDPOINT
        if (myFT.instantAds.feedEndpoint == "") {
            console.log("NO FEED");
            noFeed = true;
            Ad.pushImages();
        } else {
            console.log("FEED IS USED")
            var ftFeed = new FTFeed(myFT);
            ftFeed.getFeed(Ad.loadFeed, Ad.feedLoadError);
        }
    },
    build: function() {
        //input frame content into divs per frame
        for (i = 1; i <= framesArray.data.frameCount; i++) {
            if (i == 1) {
                //do not clone frames
            } else {
                //clone frame div based on how many frames
                var newFrameDiv = Ad.byId("f1").cloneNode(true);
                newFrameDiv.id = "f" + i;
                Ad.byId("framesContainer").appendChild(newFrameDiv);
            }
        }

        //SETS UP TEXT AND IMAGE ELEMENTS IN AD
        //FRAME DATA SETUP
        slideDuration = Number(framesArray.data.frameDelay) + 1;

        //bg img creation
        for (i = 1; i <= framesArray.data.frameCount; i++) {
            var newBgImg = document.createElement("img");
            newBgImg.src = framesArray["f" + i]["backgroundImg"];
            Ad.classInId("fbg", "f" + i).appendChild(newBgImg);
        }

        //BACKGROUND IMAGE DUPES ARRAY
        if (framesArray.data.frameCount > 1) {
            //compare f1 to f2, if same then change bgArray[1] to F1
            if (framesArray["f1"]["backgroundImg"] == framesArray["f2"]["backgroundImg"]) {
                //f1 and f2 are the same
                bgArray[1] = bgArray[0];
            } else {
                // do nothing
            }
            if (framesArray.data.frameCount > 2) {
                //compare f2 to f3, if same then change bgArray[2] to bgArray[1]
                if (framesArray["f2"]["backgroundImg"] == framesArray["f3"]["backgroundImg"]) {
                    //f1 and f2 are the same
                    bgArray[2] = bgArray[1];
                } else {
                    // do nothing
                }
                if (framesArray.data.frameCount > 3) {
                    //compare f3 to f4, if same then change bgArray[3] to bgArray[2]             
                    if (framesArray["f3"]["backgroundImg"] == framesArray["f4"]["backgroundImg"]) {
                        //f1 and f2 are the same
                        bgArray[3] = bgArray[2];
                    } else {
                        // do nothing
                    }
                }
            }
        }
        //CHECK FOR DUPES IN THE BG LOOP!
        if (framesArray.data.frameCount == 3) {
            //compare last frame to first frame
            if (framesArray["f3"]["backgroundImg"] == framesArray["f1"]["backgroundImg"]) {
                //f3 and f1 are the same
                bgArray[2] = bgArray[0];
            } else {
                // do nothing
            }
        }
        if (framesArray.data.frameCount == 4) {
            //compare last frame to first frame
            if (framesArray["f4"]["backgroundImg"] == framesArray["f1"]["backgroundImg"]) {
                //f4 and f1 are the same
                bgArray[3] = bgArray[0];
            } else {
                // do nothing
            }
        }



        //text appending
        function appendText(inputNode, target) {
            for (i = 1; i <= framesArray.data.frameCount; i++) {

                let innerHTML = framesArray["f" + i][inputNode];
                
                // For remving leading zero from date
                if(inputNode=='subHeadline2')
                    innerHTML = Ad.removeLeadingZeroFromDate(framesArray["f" + i][inputNode]);

                Ad.classInId(target, "f" + i).firstElementChild.innerHTML = innerHTML;
               
                //UPDATE STYLES
                Ad.classInId(target, "f" + i).firstElementChild.style.color = framesArray["f" + i][inputNode + "Hex"];
                Ad.classInId(target, "f" + i).firstElementChild.style.fontSize = framesArray["f" + i][inputNode + "Size"] + "px";
                Ad.classInId(target, "f" + i).firstElementChild.style.left = framesArray["f" + i][inputNode + "X"] + "px";
                Ad.classInId(target, "f" + i).firstElementChild.style[inputNode=="headline"?"bottom":"top"] = framesArray["f" + i][inputNode + "Y"] + "px";
                if (framesArray["f" + i][inputNode + "Extra"]){
                    for (let index = 0; index < framesArray["f" + i][inputNode + "Extra"].length; index++) {
                        var styles = framesArray["f" + i][inputNode + "Extra"][index];
                        var element = Ad.classInId(target, "f" + i).firstElementChild;
                        const styleList = styles.split(':');
                        element.style.setProperty(styleList[0], styleList[1]);
                    }
                }
            }
        }

        appendText("headline", "head");
        appendText("subHeadline1", "subhead1");
        appendText("subHeadline2", "subhead2");

        for (i = 1; i <= framesArray.data.frameCount; i++) {
            // remove leading zero from day and month
            let fSubHeadline2 = Ad.removeLeadingZeroFromDate(framesArray["f" + i]["subHeadline2"]);
            framesArray["f" + i]["textCheck"] = framesArray["f" + i]["headline"] + framesArray["f" + i]["subHeadline1"] + fSubHeadline2; 
        }

        //TEXT FRAME DUPES
        if (framesArray.data.frameCount > 1) {
            //compare f1 to f2, if same then change textArray[1] to F1
            if (framesArray["f1"]["textCheck"] == framesArray["f2"]["textCheck"]) {
                //f1 and f2 are the same
                textArray[1] = textArray[0];
            } else {
                // do nothing
            }
            if (framesArray.data.frameCount > 2) {
                //compare f2 to f3, if same then change textArray[2] to textArray[1]
                if (framesArray["f2"]["textCheck"] == framesArray["f3"]["textCheck"]) {
                    //f1 and f2 are the same
                    textArray[2] = textArray[1];
                } else {
                    // do nothing
                }
                if (framesArray.data.frameCount > 3) {
                    //compare f3 to f4, if same then change textArray[3] to textArray[2]             
                    if (framesArray["f3"]["textCheck"] == framesArray["f4"]["textCheck"]) {
                        //f1 and f2 are the same
                        textArray[3] = textArray[2];
                    } else {
                        // do nothing
                    }
                }
            }
        }
        //CHECK FOR DUPES IN THE TEXT LOOP!
        if (framesArray.data.frameCount == 3) {
            //compare last frame to first frame
            if (framesArray["f3"]["textCheck"] == framesArray["f1"]["textCheck"]) {
                //f3 and f1 are the same
                textArray[2] = textArray[0];
            } else {
                // do nothing
            }
        }
        if (framesArray.data.frameCount == 4) {
            //compare last frame to first frame
            if (framesArray["f4"]["textCheck"] == framesArray["f1"]["textCheck"]) {
                //f4 and f1 are the same
                textArray[3] = textArray[0];
            } else {
                // do nothing
            }
        }

//        // Auto align texts if feedloaded
//        if(myFT.instantAds.feedEndpoint != "" && myFT.instantAds.defaultFeedEndpoint != ""){
//            var tempAbsoText = document.getElementsByClassName("abso text");
//            
//            for(i = 0; i < tempAbsoText.length; i++){
//                if(i == 1 || i == 4 || i == 7 || i == 10){
//                    // move subheadline 1 to the bottom of headline
//                    tempAbsoText[i].style.top = tempAbsoText[i-1].offsetHeight + tempAbsoText[i-1].offsetTop + "px";
//                }else if(i == 2 || i == 5 || i == 8 || i == 11){
//                    // move subheadline 2 to the bottom of subheadline 2
//                    tempAbsoText[i].style.top = tempAbsoText[i-1].offsetHeight + tempAbsoText[i-1].offsetTop + "px";
//                }else{
//                    //do nothing
//                }
//            }
//        }

        // if (framesArray["data"]["ctaIconImg"].indexOf("blank") > -1) {
             Ad.byId("cta").innerHTML = framesArray.data.ctaTxt;
        // } else {
            //IF CTA ICON IMAGE IS NOT BLANK ADD IT
            //Ad.byId("cta").innerHTML = framesArray.data.ctaTxt + "<img src='" + framesArray.data.ctaIconImg + "' align='middle' id='ctaIcon' height='" + (Number(framesArray.data.ctaTxtSize) - 4) + "'>";
        //}

        //UPDATE STYLES
        Ad.byId("cta").style.color = framesArray["data"]["ctaTxtHex"];
        Ad.byId("cta").style.fontSize = framesArray["data"]["ctaTxtSize"] + "px";
        Ad.byId("cta").style.backgroundColor = framesArray["data"]["ctaBtnHex"];
        Ad.byId("cta").style.border = `2px solid ${framesArray["data"]["ctaBtnBorderHex"]}`;
        Ad.byId("cta").style.left = framesArray["data"]["ctaBtnX"] + "px";
        Ad.byId("cta").style.top = framesArray["data"]["ctaBtnY"] + "px";

        if (framesArray["f1"]["ctaToggle"] == "on") {
            Ad.byId("cta").style.zIndex = 7000;
            useSale = framesArray["f1"]["useSale"];
            if (!useSale) {
                TweenLite.to(Ad.byId("cta"), 1, { opacity: 1, delay: .5 });
            }
        }

        //Ad.byId("ctaSale").innerHTML = framesArray.data.ctaSaleTxt;
        // Ad.byId("ctaSale").style.color = framesArray["data"]["ctaTxtHex"];
        // Ad.byId("ctaSale").style.fontSize = framesArray["data"]["ctaTxtSize"] + "px";
        // Ad.byId("ctaSale").style.backgroundColor = framesArray["data"]["ctaBtnHex"];
        // Ad.byId("ctaSale").style.left = framesArray["data"]["ctaBtnX"] + "px";
        // Ad.byId("ctaSale").style.top = framesArray["data"]["ctaBtnY"] + "px";

        // if (framesArray["f1"]["ctaSaleToggle"] == "on") {
        //     Ad.byId("ctaSale").style.zIndex = 7000;
        //     TweenLite.to(Ad.byId("ctaSale"), 1, { opacity: 1, delay: .5 });
        // }

        //LEGAL TEXT AND CLICKS
        Ad.byId("ctaLegal").innerHTML = framesArray.data.legalTxt;
        Ad.byId("ctaLegal").style.color = framesArray["data"]["legalHex"];
        Ad.byId("ctaLegal").style.fontSize = framesArray["data"]["legalSize"] + "px";
        Ad.byId("legalOverlayText").innerHTML = framesArray.data.legalOverlayTxt;
        Ad.byId("legalOverlayText").style.color = framesArray["data"]["legalOverlayHex"];
        Ad.byId("legalOverlayClose").style.color = framesArray["data"]["legalOverlayHex"];
        Ad.byId("legalOverlayText").style.fontSize = framesArray["data"]["legalOverlaySize"] + "px";

        //AWN-20211123: Change legal text to be unlickable when there is no overlay text
        if (myFT.instantAds.legalOverlay_txt == "") {
            Ad.byId("ctaLegal").style.zIndex = "8000";
        }

        //SETS FRAME 1 LEGAL TO ON
        if (framesArray["f1"]["legalToggle"] == "on") {
            Ad.byId("ctaLegal").style.left = framesArray["f1"]["legalX"] + "px";
            Ad.byId("ctaLegal").style.top = framesArray["f1"]["legalY"] + "px";
            TweenLite.to(Ad.byId("ctaLegal"), 1, { opacity: 1, delay: .6 });
            if (framesArray.data.legalOverlayTxt != "") {
                Ad.byId("ctaLegal").addEventListener("click", Ad.legalClick)
            }
        }

        //MEDALLION CTA
        // var newMedallionImg = new Image();
        //newMedallionImg.src = framesArray["data"]["oceanMedallionImg"];
       // Ad.byId("ctaMedallion").appendChild(newMedallionImg);
        // if (framesArray["f1"]["medallionToggle"] == "on") {
        //     TweenLite.to(Ad.byId("cta"), 1, { opacity: 1, delay: .5 });
        //     Ad.byId("ctaMedallion").style.display = "block";
        //     Ad.byId("ctaMedallion").addEventListener("mouseover", Ad.overlayHover);
        // }

        //Ad.byId("medallionOverlayText").innerHTML = framesArray["data"]["oceanMedallionOverlayTxt"];
        //Ad.byId("medallionOverlayText").style.fontSize = framesArray["data"]["oceanMedallionTxtSize"] + "px";
        //Ad.byId("medallionOverlayText").style.color = framesArray["data"]["oceanMedallionTxtHex"];
        //Ad.byId("medallionOverlayClose").style.color = framesArray["data"]["oceanMedallionTxtHex"];
        //Ad.byId("medallionOverlay").style.backgroundColor = Ad.hexToRgbA(framesArray.data.oceanMedallionTxtbgHex, framesArray.data.oceanMedallionTxtbgOpacity);

        //LOGO IMG
        var newLogoImg = new Image();
        newLogoImg.src = framesArray["data"]["logoImg"];
        newLogoImg.style.left = framesArray["data"]["logoImgX"];
        newLogoImg.style.top = framesArray["data"]["logoImgY"];
        Ad.byId("logo1").appendChild(newLogoImg);
        if (framesArray["f1"]["logoToggle"] == "on") {
            Ad.byId("logo1").style.opacity = 1;
        }
        //LOGO 2 IMG
        var newLogo2Img = new Image();
        newLogo2Img.src = framesArray["data"]["logo2Img"];
        newLogo2Img.style.left = framesArray["data"]["logo2ImgX"];
        newLogo2Img.style.top = framesArray["data"]["logo2ImgY"];
        Ad.byId("logo2").appendChild(newLogo2Img);
        if (framesArray["f1"]["logo2Toggle"] == "on") {
            Ad.byId("logo2").style.opacity = 1;
        }

        //APPEND STATE CLICK TRACKING AND CLICKTAG
        if (framesArray.data.frameCount >= 1) {
            //add click event listenr for click f1
            Ad.classInId("click", "f1").addEventListener("click", function() {
                var sectionArray = [];
                if (framesArray["f1"]["itinerary"] != undefined) {
                    var currentItin = itineraries[framesArray["f1"]["itinerary"]];
                    sectionArray.push(currentItin._id, currentItin.name, currentItin.price, currentItin.oceanflag);
                    Tracker.clickTrackEvent(sectionArray, 'ft_section', false);
                } 
                // else {
                //     sectionArray = "nofeeddata";
                // }
                

                myFT.clickTag(1, framesArray["f1"]["clickTag"]);
            });
            if (framesArray.data.frameCount >= 2) {
                //add click event listenr for click f2
                Ad.classInId("click", "f2").addEventListener("click", function() {
                    var sectionArray = [];
                    if (framesArray["f2"]["itinerary"] != undefined) {
                        var currentItin = itineraries[framesArray["f2"]["itinerary"]];
                        sectionArray.push(currentItin._id, currentItin.name, currentItin.price, currentItin.oceanflag);
                        Tracker.clickTrackEvent(sectionArray, 'ft_section', false);
                    } 
                    // else {
                    //     sectionArray = "nofeeddata";
                    // }
                    

                    myFT.clickTag(2, framesArray["f2"]["clickTag"]);
                });
                if (framesArray.data.frameCount >= 3) {
                    //add click event listenr for click f3
                    Ad.classInId("click", "f3").addEventListener("click", function() {
                        var sectionArray = [];
                        if (framesArray["f3"]["itinerary"] != undefined) {
                            var currentItin = itineraries[framesArray["f3"]["itinerary"]];
                            sectionArray.push(currentItin._id, currentItin.name, currentItin.price, currentItin.oceanflag);
                            Tracker.clickTrackEvent(sectionArray, 'ft_section', false);
                        } 
                        // else {
                        //     sectionArray = "nofeeddata";
                        // }
                        

                        myFT.clickTag(3, framesArray["f3"]["clickTag"]);
                    });
                    if (framesArray.data.frameCount >= 4) {
                        //add click event listenr for click f3
                        Ad.classInId("click", "f4").addEventListener("click", function() {
                            var sectionArray = [];
                            if (framesArray["f4"]["itinerary"] != undefined) {
                                var currentItin = itineraries[framesArray["f4"]["itinerary"]];
                                sectionArray.push(currentItin._id, currentItin.name, currentItin.price, currentItin.oceanflag);
                                Tracker.clickTrackEvent(sectionArray, 'ft_section', false);
                            } 
                            // else {
                            //     sectionArray = "nofeeddata";
                            // }
                            

                            myFT.clickTag(4, framesArray["f4"]["clickTag"]);
                        });
                    }
                }
            }
        }

        //SET MEDALLION TOGGLE TO OFF FOR NO FEED
        for (i = 1; i <= framesArray.data.frameCount; i++) {
            if (framesArray["f" + i]["medallionToggle"] == undefined) {
                framesArray["f" + i]["medallionToggle"] = "off";
            }
        }

       
        //CTA HOVER
        container.addEventListener("mouseover", function() {
            // arrows.style.opacity = 1;
            cta.style.color = framesArray.data.ctaTxtHexHov;
            cta.style.backgroundColor = framesArray.data.ctaBtnHexHov;
            cta.style.border =`2px solid ${framesArray.data.ctaBtnBorderHexHov}`;
            // ctaSale.style.color = framesArray.data.ctaTxtHexHov;
            // ctaSale.style.backgroundColor = framesArray.data.ctaBtnHexHov;
        });
        container.addEventListener("mouseout", function() {
            // arrows.style.opacity = 0;
            cta.style.color = framesArray.data.ctaTxtHex;
            cta.style.backgroundColor = framesArray.data.ctaBtnHex;
            cta.style.border =`2px solid ${framesArray.data.ctaBtnBorderHex}`;
            // ctaSale.style.color = framesArray.data.ctaTxtHex;
            // ctaSale.style.backgroundColor = framesArray.data.ctaBtnHex;
        });
        if (useA) {
            Ad.byId("left_arrow").innerHTML = framesArray.data.leftArrow;
            Ad.byId("right_arrow").innerHTML = framesArray.data.rightArrow;
            var elements = document.querySelectorAll('.arrow');
            for (var i = 0; i < elements.length; i++) {
                elements[i].style.fontSize = framesArray.data.arrowsSize + "px";
                elements[i].style.color = framesArray.data.arrowsHex;
                elements[i].style.backgroundColor = Ad.hexToRgbA(framesArray.data.arrowsBgHex, framesArray.data.arrowsBgOpacity);
            }
            Ad.byId("right_arrow").addEventListener("click", Ad.nextClick);
            Ad.byId("left_arrow").addEventListener("click", Ad.prevClick);
            container.addEventListener("mouseover", function() {
                arrows.style.opacity = 1;
                left_arrow.style.opacity = 1;
                right_arrow.style.opacity = 1;
            });
            container.addEventListener("mouseout", function() {
                arrows.style.opacity = 0;
                left_arrow.style.opacity = 0;
                right_arrow.style.opacity = 0;
            });

        } else if (useD) {
            // BUILD OUT DOTS BASED ON FRAME COUNT AND SHOW #DOTS DIV
            for (i = 0; i < framesArray.data.frameCount; i++) {
                var newDiv = document.createElement("div");
                newDiv.classList.add("dot");
                Ad.byId("dotNav").appendChild(newDiv);
                navDotsArray.push(i);
            }
            
            // AUTO CENTER DOTS BASED ON NUMBER OF DOTS.
            
            console.log(parseInt(framesArray.data.frameCount));
            switch(parseInt(framesArray.data.frameCount)){
                case 2: dotNav.style.left = dotNav.offsetLeft + 11 + "px";
                        console.log(2);
                        break;
                case 3: dotNav.style.left = dotNav.offsetLeft + 5 + "px";
                        console.log(3);
                        break;
                default:
                        break;
            }
            
            Ad.detectSwipe("container");
        }

        if (!noFeed) {
            Ad.fontResize();
        } else {
            Ad.animate();
        }

    },
    removeLeadingZeroFromDate(string){
        // remove leading zero from day and month
        if(string=='') return string;
        let expected = string.match(/\d{1,2}\D\d{1,2}\D(\d{4}|\d{2})/g);
        if (typeof expected == 'object' && expected != null) {
            let departureDate = Object.values(expected)[0];
            let removeLeadingZero = Object.values(expected)[0].replace(/(^|\/)0+/g, "$1");
            let result = string.replace(departureDate, removeLeadingZero);
            return result;
        }else return string;
    }
};

myFT.on("instantads", Ad.init);