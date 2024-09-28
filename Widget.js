define(['dojo/_base/declare',
    'jimu/BaseWidget',
    'jimu/WidgetManager',
    'esri/Color',
    'esri/graphic',
    'esri/geometry/Point',
    'esri/symbols/SimpleMarkerSymbol',
    'esri/symbols/SimpleLineSymbol',
    'esri/tasks/query',
    'dijit/form/DateTextBox',
    'dijit/form/Button',
    'dijit/form/NumberSpinner',
    'dijit/form/NumberTextBox',
    'dijit/form/CheckBox',
    'dijit/form/Select',
    'dijit/form/TextBox',
    'dijit/layout/ContentPane',
    'dijit/registry',
    'dojox/form/Uploader',
    'dojox/form/uploader/FileList',
    'dojox/layout/TableContainer',
    'dojo/_base/lang',
    'dojo/dom',
    'dojo/dom-attr',
    'dojo/dom-style',
    'dojo',
    'dojo/parser',
    'dojo/domReady!'],
    function (declare,
        BaseWidget,
        WidgetManager,
        Color,
        Graphic,
        Point,
        SimpleMarkerSymbol,
        SimpleLineSymbol,
        Query,
        DateTextBox,
        Button,
        NumberSpinner,
        NumberTextBox,
        CheckBox,
        Select,
        TextBox,
        ContentPane,
        registry,
        Uploader,
        FileList,
        TableContainer,
        lang,
        dom,
        domAttr,
        domStyle,
        dojo,
        parser) {
        return declare([BaseWidget], {
            // Custom widget code goes here

            baseClass: 'jimu-widget-coordslocator',

            validAttachmentExtension: '7Z AIF AVI BMP CSV DOC DOCX DOT ECW EMF EPS GEOJSON GIF GML GPKG GTAR GZ IMG J2K JP2 JPC JPE JPEG JPF JPG JSON M4A MDB MID MOV MP2 MP3 MP4 MPA MPE MPEG MPG MPV2 PDF PNG PPT PPTX PS PSD QT RA RAM RAW RMI SID TAR TGZ TIF TIFF TXT VRML WAV WMA WMF WMV WPS XLS XLSX XLT XML ZIP',

            maxAttachmentSize : 32 * 1024 * 1024,

            //this property is set by the framework when widget is loaded.
            name: 'Coordinate Locator',

            postCreate: function () {
                this.inherited(arguments);
                console.log('postCreate');
            },

            startup: function () {
                this.inherited(arguments);
                this._parentId = this.domNode.parentNode.id;
                try {
                    this.visualStartup();
                    this.createFeatureForm();
                }
                catch (err) {
                    console.log(err);
                }
                console.log('startup');
            },

            // onOpen: function(){
            //   console.log('onOpen');
            // },

             onClose: function(){
                 console.log('onClose');
                 this._dismissLocation();
             },

            // onMinimize: function(){
            //   console.log('onMinimize');
            // },

            // onMaximize: function(){
            //   console.log('onMaximize');
            // },

            // onSignIn: function(credential){
            //   /* jshint unused:false*/
            //   console.log('onSignIn');
            // },

            // onSignOut: function(){
            //   console.log('onSignOut');
            // }

            // onPositionChange: function(){
            //   console.log('onPositionChange');
            // },

            resize: function () {
                if (domStyle.get(this.__formContentPanel.id, 'display') === 'block') {
                    this.fillHeight();
                }
                console.log('resize');
            },

            fillHeight: function () {
                
                var panelDom = dom.byId(this._parentId);
                var panelInfo = dojo.position(panelDom);
                var contentInfo = dojo.position(this._contentDiv);
                var hcc = panelInfo.h + panelInfo.y - contentInfo.y - 20;

                domStyle.set(this._contentDiv, 'height', hcc + 'px');
            },

            createFeatureForm: async function () {
                this.featureLayer = this.map.itemInfo.itemData.operationalLayers.find(layer => {
                    return layer.title == this.config.featureLayerDestino.titulo;
                });
                if (this.featureLayer != undefined) {
                    var tableContainer = new TableContainer({
                        cols: 1,
                        labelWidth: 200,
                        orientation: 'ver',
                        style: 'padding:2px;overflow-y:scroll;overflow-x:hidden;height:100%'
                    });
                    this.featureLayer.popupInfo.fieldInfos.forEach((fi) => {
                        if (fi.visible) {
                            var component = null;

                            var field = this.featureLayer.resourceInfo.fields.find((f) => {
                                return f.name == fi.fieldName;
                            })
                            if (field != undefined) {
                                if (field.type == "esriFieldTypeDate") {
                                    component = new DateTextBox({
                                        constraints: {
                                            datePattern: 'yyyy-MM-dd'
                                        },
                                        id: this._parentId + "_" + fi.fieldName,
                                        name: fi.fieldName,
                                        label: fi.label + " :",
                                        required: !field.nullable,
                                        disabled: !fi.isEditable,
                                        style: "width:100%",
                                        class: "form-control"
                                    });
                                }
                                else if (field.type == "esriFieldTypeString" && field.domain != null) {
                                    options = [];
                                    field.domain.codedValues.forEach((codedValue) => {
                                        options.push({ label: codedValue.name, value: codedValue.code })
                                    })

                                    component = new Select({
                                        id: this._parentId + "_" + fi.fieldName,
                                        name: fi.fieldName,
                                        label: fi.label + " :",
                                        required: !field.nullable,
                                        disabled: !fi.isEditable,
                                        options: options,
                                        style: "width:100%",
                                        class: "form-control",
                                        disable: false
                                    });
                                }
                                else if (field.type == "esriFieldTypeString" && field.domain == null) {
                                    component = new TextBox({
                                        id: this._parentId + "_" + fi.fieldName,
                                        name: fi.fieldName,
                                        label: fi.label + " :",
                                        required: !field.nullable,
                                        disabled: !fi.isEditable,
                                        uppercase : true,
                                        style: "width:100%",
                                        class: "form-control"
                                    });
                                }
                                else if (field.domain != null && (field.type == "esriFieldTypeDouble" || field.type == "esriFieldTypeInteger")) {
                                    component = new NumberSpinner({
                                        id: this._parentId + "_" + fi.fieldName,
                                        name: fi.fieldName,
                                        label: fi.label + " :",
                                        intermediateChanges: true,
                                        required: !field.nullable,
                                        disabled: !fi.isEditable,
                                        style: "width:100%",
                                        class: "form-control"
                                    });

                                    if (field.domain.type == "range") {
                                        constraints = { min: field.domain.range[0], max: field.domain.range[1], places: fi.format != undefined ? fi.format.places : field.type == "esriFieldTypeDouble" ? 2 : 0 };
                                        component.constraints = constraints;
                                    };
                                }
                                else if (field.type == "esriFieldTypeDouble" || field.type == "esriFieldTypeInteger") {
                                    component = new NumberSpinner({
                                        id: this._parentId + "_" + fi.fieldName,
                                        name: fi.fieldName,
                                        label: fi.label + " :",
                                        intermediateChanges: true,
                                        required: !field.nullable,
                                        disabled: !fi.isEditable,
                                        constraints: { min: 0, places: fi.format != undefined ? fi.format.places : field.type == "esriFieldTypeDouble" ? 2 : 0 },
                                        style: "width:100%",
                                        class: "form-control"
                                    });
                                }
                            }
                            if (component) {
                                tableContainer.addChild(component);
                            }
                            divComponent = null;
                            component = null;
                        }
                    });
                    if (this.featureLayer.resourceInfo.hasAttachments) {
                        var fileUploader = new Uploader({
                            id: this._parentId + "_fileUploader",
                            name: "fileUploader",
                            label: "Agregar adjuntos...",
                            multiple: true,
                            style: "width:100%"
                        });

                        var fileList = new FileList({
                            id: this._parentId + "_fileUploaderList",
                            name:"fileUploaderList",
                            headerFilename: "Archivo",
                            headerType: "Tipo",
                            headerFilesize: "Tamaño",
                            uploaderId: "fileUploader",
                            style:"margin:5px"
                        });

                        var attachmentContentPane = new ContentPane({
                            id: this._parentId + "_attachmentContentPane",
                            name:"attachmentContentPane",
                            style:"display:none",
                            label: "",
                        });

                        var clearAttchmentsButton = new Button({
                            id : this._parentId + "_clearAttchments",
                            name:"clearAttchments",
                            label : "Limpiar Adjuntos",
                            onClick : function() { fileUploader.reset() }
                        });

                        attachmentContentPane.addChild(fileUploader);
                        attachmentContentPane.addChild(clearAttchmentsButton);
                        attachmentContentPane.addChild(fileList);

                        tableContainer.addChild(attachmentContentPane)
                    }
                    this.__formContentPanel = new ContentPane({
                        title: "Formulario",
                        style: "width:100%;height:200px;border: 1px solid lightgray;display:none",
                        content: tableContainer
                    }, this._contentDiv);
                    this.__formContentPanel.startup();
                }
            },

            visualStartup: function () {
                try {
                    // parser.parse();
                    this.__validationDijits = [];
                    domAttr.set(this.domNode, 'tabindex', 0);

                    this.__latDegreesNumberSpinner = new NumberSpinner({
                        value: 4,
                        smallDelta: 1,
                        constraints: { min: 0, max: 89, places: 0 },
                        selectOnClick: true,
                        required: true,
                        tabIndex: 2,
                        style:"width:65px"
                    }, this._latDegreesNumberSpinner);
                    this.__latDegreesNumberSpinner.startup();
                    this.__validationDijits.push(this.__latDegreesNumberSpinner);

                    this.__latMinutesNumberSpinner = new NumberSpinner({
                        value: 0,
                        smallDelta: 1,
                        constraints: { min: 0, max: 59, places: 0 },
                        selectOnClick: true,
                        required: true,
                        tabIndex: 3,
                        style: "width:65px"
                    }, this._latMinutesNumberSpinner);
                    this.__latMinutesNumberSpinner.startup();
                    this.__validationDijits.push(this.__latMinutesNumberSpinner);

                    this.__latSecondsNumberSpinner = new NumberSpinner({
                        value: 0,
                        smallDelta: 0.01,
                        constraints: { min: 0, max: 59, places: 2 },
                        selectOnClick: true,
                        required: true,
                        tabIndex: 4,
                        style: "width:85px"
                    }, this._latSecondsNumberSpinner);
                    this.__latSecondsNumberSpinner.startup();
                    this.__validationDijits.push(this.__latSecondsNumberSpinner);

                    this.__latQuadranteSelect = new Select({
                        name: "latitudeQuadrant",
                        tabIndex: 5,
                        options: [
                            { label: "N", value: "N", selected: true },
                            { label: "S", value: "S" }
                        ]
                    }, this._latQuadrantSelect);
                    this.__latQuadranteSelect.startup();

                    this.__longDegreesNumberSpinner = new NumberSpinner({
                        value: 74,
                        smallDelta: 1,
                        constraints: { min: 0, max: 179, places: 0 },
                        selectOnClick: true,
                        required: true,
                        tabIndex: 6,
                        style: "width:65px"
                    }, this._longDegreesNumberSpinner);
                    this.__longDegreesNumberSpinner.startup();
                    this.__validationDijits.push(this.__longDegreesNumberSpinner);

                    this.__longMinutesNumberSpinner = new NumberSpinner({
                        value: 0,
                        smallDelta: 1,
                        constraints: { min: 0, max: 59, places: 0 },
                        selectOnClick: true,
                        required: true,
                        tabIndex: 7,
                        style: "width:65px"
                    }, this._longMinutesNumberSpinner);
                    this.__longMinutesNumberSpinner.startup();
                    this.__validationDijits.push(this.__longMinutesNumberSpinner);

                    this.__longSecondsNumberSpinner = new NumberSpinner({
                        value: 0,
                        smallDelta: 0.01,
                        constraints: { min: 0, max: 59, places: 2 },
                        selectOnClick: true,
                        required: true,
                        tabIndex: 8,
                        style: "width:85px"
                    }, this._longSecondsNumberSpinner);
                    this.__longSecondsNumberSpinner.startup();
                    this.__validationDijits.push(this.__longSecondsNumberSpinner);

                    this.__longQuadranteSelect = new Select({
                        name: "longitudeQuadrant",
                        tabIndex: 9,
                        options: [
                            { label: "E", value: "E" },
                            { label: "W", value: "W", selected: true }
                        ]
                    }, this._longQuadrantSelect);
                    this.__longQuadranteSelect.startup();

                    this.__locateButton = new Button({
                        label: "Ubicar",
                        showLabel: true,
                        tabIndex: 12,
                        onClick: lang.hitch(this, this._locateCoordinates)
                    }, this._locateButton);
                    this.__locateButton.startup();

                    this.__addButton = new Button({
                        label: "Agregar",
                        showLabel: true,
                        tabIndex: 13,
                        onClick: lang.hitch(this, this._addCoordsLocation)
                    }, this._addButton);
                    this.__addButton.startup();
                    this.__addButton.setDisabled(true);

                    this.__saveButton = new Button({
                        label: "Guardar",
                        showLabel: true,
                        tabIndex: 14,
                        onClick: lang.hitch(this, this._saveLocation)
                    }, this._saveButton);
                    this.__saveButton.startup();
                    this.__saveButton.setDisabled(true);

                    this.__dismissButton = new Button({
                        label: "Descartar",
                        showLabel: true,
                        tabIndex: 15,
                        onClick: lang.hitch(this, this._dismissLocation)
                    }, this._dismissButton);
                    this.__dismissButton.startup();
                    this.__dismissButton.setDisabled(true);

                    this.__formatTypeCheckBox = new CheckBox({
                        tabIndex: 1,
                        checked: false,
                        value: "Grados decimales",
                        onChange: lang.hitch(this, this._changeformat)

                    }, this._formatTypeCheckBox);
                    this.__formatTypeCheckBox.startup();

                    this.__decimalDegreesLatitudeNumberTextBox = new NumberTextBox({
                        name:"latDD",
                        value: 4,
                        tabIndex: 10,
                        constraints: {
                            pattern: '#####0.##########',
                            min:-90,
                            max:90,
                            places:10}
                    }, this._decimalDegreesLatitudeNumberTextBox);
                    this.__decimalDegreesLatitudeNumberTextBox.startup();

                    this.__decimalDegreesLongitudNumberTextBox = new NumberTextBox({
                        name:"lonDD",
                        value: -74,
                        tabIndex: 11,
                        constraints: {
                            pattern: '#####0.##########',
                            min:-180,
                            max:180,
                            places:10}
                    }, this._decimalDegreesLongitudNumberTextBox);
                    this.__decimalDegreesLongitudNumberTextBox.startup();

                    this.fillHeight();
                    console.log('visualStartup');
                }
                catch (err) {
                    console.log(err);
                }
            },

            _changeformat: function() {
                if (this.__formatTypeCheckBox.checked) {
                    domStyle.set(this._decimalDegreesContainer, "display", "block");
                    domStyle.set(this._dMSContainer, "display", "none");
                    this._formatIsClicked = "off";
                }
                else {
                    domStyle.set(this._decimalDegreesContainer, "display", "none");
                    domStyle.set(this._dMSContainer, "display", "block");
                    this._formatIsClicked = "on";
                }
            },

            _saveLocation: async function () {
                var attributes = {};
                var isValid = true;
                var isAttachmentsValid = true;

                this.featureLayer.popupInfo.fieldInfos.forEach(fi => {
                    if (fi.visible) {
                        var dijit = registry.byId(this._parentId + "_" + fi.fieldName);
                        if (dijit != undefined) {
                            var value = dijit.get("value");

                            console.log(dijit.id);
                            console.log(fi.fieldName)
                            console.log(value)

                            if (dijit instanceof NumberSpinner) {
                                console.log(dijit.isValid(false));
                                isValid = isValid && dijit.isValid(false);
                            }
                            attributes[ fi.fieldName] = value instanceof Date ? value.getTime() : value;
                        }
                    }
                });

                if (this.featureLayer.layerObject.hasAttachments) {
                    var dijit = registry.byId(this._parentId + "_fileUploader");
                    if (dijit != undefined) {
                        var files = dijit.getFileList();
                        files.forEach(f => {
                            isAttachmentsValid = isAttachmentsValid &&
                                this.validAttachmentExtension.includes(f.name.split('.').pop().toUpperCase()) &&
                                this.maxAttachmentSize > f.size;
                        });
                    }
                };

                if (isValid && isAttachmentsValid) {
                    var graphic = new Graphic(this.geometry, null, attributes, null);
                    var adds = [graphic]
                    var results = await this.featureLayer.layerObject.applyEdits(adds, null, null);
                    var attachmentMsg = "";

                    if (this.featureLayer.layerObject.hasAttachments && results.length > 0 && results[0].success) {
                        var dijit = registry.byId(this._parentId + "_fileUploader");
                        var fileList = registry.byId(this._parentId + "_fileUploaderList");
                        if (dijit != undefined) {
                            var files = dijit.getFileList()
                            if (files.length > 0) {
                                if( fileList != undefined) {
                                    fileList.showProgress(true)
                                }
                                for (let indice = 0; indice < files.length; indice++) {
                                    try {
                                        var form = new FormData();
                                        form.append("attachment", dijit.inputNode.files[indice]);

                                        var attachResult = await this.featureLayer.layerObject.addAttachment(results[0].objectId, form);
                                        attachmentMsg = attachmentMsg + "<br/><span style='font-weight:bolder'>Se agregó el adjunto '" + files[indice].name + "' attachmentId =  " + attachResult.attachmentId + "</span>";
                                    }
                                    catch (error) {
                                        console.log(error);
                                        attachmentMsg = attachmentMsg + "<br/><span style='color:red;font-weight:bolder'>No se pudo agregar el adjunto '" + files[indice].name + "'. error.message</span>";
                                    }
                                }
                                if( fileList != undefined) {
                                    fileList.hideProgress(true)
                                }
                            }
                        }
                        dijit.reset();
                    }

                    if (results.length > 0 && results[0].success) {
                        this._messageSpan.innerHTML = "<span style='font-weight:bolder'>Elemento agregado. OBJECTID = " + results[0].objectId + ".</span>" + attachmentMsg;
                    }
                    else {
                        this._messageSpan.innerHTML = "<span style='color:red;font-weight:bolder'>No se pudo agregar elemento: '" + results[0].error + "'.</span>";
                    }
                    this.map.graphics.clear();
                    this.__addButton.setDisabled(true);
                    this.__dismissButton.setDisabled(true);
                    this.__locateButton.setDisabled(false);
                    this.__saveButton.setDisabled(true);
                    domStyle.set(this.__formContentPanel.id, 'display', 'none');
                }
                else {
                    this._messageSpan.innerHTML = isAttachmentsValid ? "<span style='color:red;font-weight:bolder'>Datos inválidos.</span>" : "<span style='color:red;font-weight:bolder'>Adjuntos inválidos.</span>";
                }
            },

            _addCoordsLocation: function () {
                this.__addButton.setDisabled(true);
                this.__saveButton.setDisabled(false);
                domStyle.set(this.__formContentPanel.id, 'display', 'block')
                this.fillHeight();

                this.featureLayer.popupInfo.fieldInfos.forEach(fi => {
                    var dijit = registry.byId(this._parentId + "_" + fi.fieldName);
                    if (dijit != undefined) {
                        if (dijit.id == this._parentId + "_" + this.config.featureLayerDestino.camposCalculados.campoFecha) {
                            var fecha = new Date();
                            dijit.set("value", fecha);
                        }
                        else if (dijit.id == this._parentId + "_" + this.config.featureLayerDestino.camposCalculados.campoLatitud) {
                            dijit.set("value", this.latitud);
                        }
                        else if (dijit.id == this._parentId + "_" + this.config.featureLayerDestino.camposCalculados.campoLongitud) {
                            dijit.set("value", this.longitud);
                        }
                        else {
                            var valorInterseccion = this.valoresInterseccion.find(item => {
                                return dijit.id == this._parentId + "_" + item.campoDestino;
                            })
                            if (valorInterseccion != undefined) {
                                dijit.set("value", valorInterseccion.valor);
                            }
                        }
                    }
                });
            },

            _dismissLocation: function () {

                this._messageSpan.innerHTML = "<br />";

                this.map.graphics.clear();
                this.__addButton.setDisabled(true);
                this.__dismissButton.setDisabled(true);
                this.__locateButton.setDisabled(false);
                this.__saveButton.setDisabled(true);
                console.log(this.__formContentPanel.id)
                domStyle.set(this.__formContentPanel.id, 'display', 'none');
            },

            _locateCoordinates: async function () {
                var normal = this.__validationDijits.every(dijit => {
                    return dijit.state !== 'Error';
                });
                if (normal) {
                    this._messageSpan.innerHTML = "<br />";

                    if (!this.__formatTypeCheckBox.checked){
                        var yd = this.__latDegreesNumberSpinner.value;
                        var ym = this.__latMinutesNumberSpinner.value;
                        var ys = this.__latSecondsNumberSpinner.value;
                        var yq = this.__latQuadranteSelect.value;
    
                        var xd = this.__longDegreesNumberSpinner.value;
                        var xm = this.__longMinutesNumberSpinner.value;
                        var xs = this.__longSecondsNumberSpinner.value;
                        var xq = this.__longQuadranteSelect.value;
    
                        var x = (xd + xm / 60 + xs / 3600) * (xq == "E" ? 1.0 : -1.0);
                        var y = (yd + ym / 60 + ys / 3600) * (yq == "N" ? 1.0 : -1.0);

                        this.latitud = yd + "°" + ym + "\'" + ys + "\"" + yq;
                        this.longitud = xd + "°" + xm + "\'" + xs + "\"" + xq;
                    }
                    else{
                        var x = this.__decimalDegreesLongitudNumberTextBox.value;
                        var y = this.__decimalDegreesLatitudeNumberTextBox.value;
                        this.latitud = y;
                        this.longitud = x;
                    }

                    this.geometry = new Point({ x: x, y: y });
                    var outlineSymbol = new SimpleLineSymbol();

                    outlineSymbol.setWidth(2);
                    outlineSymbol.setColor(new Color([0, 115, 76, 1]));

                    var markerSymbol = new SimpleMarkerSymbol();
                    markerSymbol.setAngle(1);
                    markerSymbol.setColor(new Color([0, 255, 197, 0.50]));
                    markerSymbol.setOutline(outlineSymbol);
                    markerSymbol.setSize(24);

                    var graphic = new Graphic(this.geometry, markerSymbol);

                    this.map.graphics.clear();
                    this.map.graphics.add(graphic);
                    this.map.centerAndZoom(this.geometry, 12);

                    this.valoresInterseccion = [];
                    this.config.featureLayerDestino.intersecciones.forEach(async item => {
                        var valor = await this._getIntersectedFeatureValue(item.tituloCapaFuente, this.geometry, item.campoFuente)
                        this.valoresInterseccion.push({ campoDestino: item.campoDestino, valor: this._toProperCase(valor) })
                        console.log(item.campoDestino + " = '" + this._toProperCase(valor) + "'");
                    });

                    this.__addButton.setDisabled(false);
                    this.__dismissButton.setDisabled(false);
                    this.__locateButton.setDisabled(true);
                }
                else {
                    this._messageSpan.innerHTML = "Coordenadas inválidas";
                }
            },

            _getIntersectedFeatureValue: async function (title, point, field) {
                featureLayer = this.map.itemInfo.itemData.operationalLayers.find(layer => {
                    return layer.title == title;
                });
                var fieldValue = "";
                if (featureLayer != undefined) {

                    var query = new Query();
                    query.geometry = point;
                    query.outFields = [field];
                    query.returnGeometry = false;

                    var results = await featureLayer.layerObject.queryFeatures(query);

                    if (results.features.length > 0) {
                        fieldValue = results.features[0].attributes[field];
                    }
                }
                return fieldValue;
            },

            _toProperCase: function (value) {
                return value.toLowerCase().replace(/(^|[\s\xA0])[^\s\xA0]/g, function (s) { return s.toUpperCase(); })
            }
        });
  });