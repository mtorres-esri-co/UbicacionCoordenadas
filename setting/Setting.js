define(['dojo/_base/declare',
    'jimu/BaseWidgetSetting',
    'dijit/_WidgetsInTemplateMixin',
    'dijit/form/Button',
    'dijit/form/Select',
    'dijit/form/TextBox',
    'dojo/_base/lang',
    'dojo/data/ObjectStore',
    'dojo/store/Memory',
    'dojo/parser',
    'dojo/domReady!'],
    function (declare,
        BaseWidgetSetting,
        _WidgetsInTemplateMixin,
        Button,
        Select,
        TextBox,
        lang,
        ObjectStore,
        Memory,
        parser) {
        return declare([BaseWidgetSetting, _WidgetsInTemplateMixin], {
            baseClass: 'jimu-widget-coordslocator-setting',

            postCreate: function () {
                this.inherited(arguments);
                try {
                    this.__tituloCapaDestino = this.config.featureLayerDestino.titulo;
                    this.__campoFecha = this.config.featureLayerDestino.camposCalculados.campoFecha;
                    this.__campoLatitud = this.config.featureLayerDestino.camposCalculados.campoLatitud;
                    this.__campoLongitud = this.config.featureLayerDestino.camposCalculados.campoLongitud;
                    this.__intersecciones = this.config.featureLayerDestino.intersecciones;
                }
                catch (err) {
                    console.log(err);
                }
            },

            startup: function () {
                this.inherited(arguments);
                try {
                    this.fillLayerList();
                    this.visualStartup();
                    this.setValues();
                }
                catch (err) {
                    console.log(err);
                }
                console.log('startup');
            },

            setConfig: function (config) {
                console.log('setConfig');
            },

            destroy: function () {
                this.inherited(arguments);
            },

            getConfig: function () {
                console.log('getConfig')
                this.config.featureLayerDestino.titulo = this.__tituloCapaDestino;
                this.config.featureLayerDestino.camposCalculados.campoFecha = this.__campoFecha;
                this.config.featureLayerDestino.camposCalculados.campoLatitud = this.__campoLatitud;
                this.config.featureLayerDestino.camposCalculados.campoLongitud = this.__campoLongitud;
                this.config.featureLayerDestino.intersecciones = this.__intersecciones;

                return this.config;
            },

            fillLayerList: function () {
                console.log('fillLayerList')
                this.pointFeatureLayers = this.featureLayer = this.map.itemInfo.itemData.operationalLayers.filter(layer => {
                    return layer.layerType == "ArcGISFeatureLayer" && layer.layerObject.geometryType == "esriGeometryPoint" && layer.popupInfo != undefined;
                });
                this.polygonFeatureLayers = this.featureLayer = this.map.itemInfo.itemData.operationalLayers.filter(layer => {
                    console.log(layer);
                    return layer.layerType == "ArcGISFeatureLayer" && layer.layerObject.geometryType == "esriGeometryPolygon" && layer.popupInfo != undefined;
                });
            },

            visualStartup: function () {
                console.log("visualStartup");                
                try {
                    // parser.parse();

                    this.__capaDestinoSelect = new Select({
                        required: true,
                        style: "width:100%",
                        onChange: lang.hitch(this, this._setCapaDestino)
                    }, "capaDestinoSelect");
                    this.__capaDestinoSelect.startup();

                    this.__campoFechaSelect = new Select({
                        required: true,
                        style: "width:100%",
                        onChange: lang.hitch(this, this._setCampoFecha)
                    }, "campoFechaSelect");
                    this.__campoFechaSelect.startup();

                    this.__campoLatitudSelect = new Select({
                        required: true,
                        style: "width:100%",
                        onChange: lang.hitch(this, this._setCampoLatitud)
                    }, "campoLatitudSelect");
                    this.__campoLatitudSelect.startup();

                    this.__campoLongitudSelect = new Select({
                        required: true,
                        style: "width:100%",
                        onChange: lang.hitch(this, this._setCampoLongitud)
                    }, "campoLongitudSelect");
                    this.__campoLongitudSelect.startup();

                    this.__interseccionesSelect = new Select({
                        dropDown: false,
                        required: true,
                        style: "width:100%",
                        onChange: lang.hitch(this, this._setInterseccion)
                    }, "interseccionesSelect");
                    this.__interseccionesSelect.startup();

                    this.__nombreInterseccionTextBox = new TextBox({
                        required: true,
                        disabled: false,
                        style: "width:100%",
                        onChange: lang.hitch(this, this._setNombreInterseccion)
                    }, "nombreInterseccionTextBox");
                    this.__nombreInterseccionTextBox.startup();

                    this.__capaOrigenSelect = new Select({
                        required: true,
                        disabled: true,
                        style: "width:100%",
                        onChange: lang.hitch(this, this._setCapaOrigen)
                    }, "capaOrigenSelect");
                    this.__capaOrigenSelect.startup();

                    this.__campoFuenteSelect = new Select({
                        required: true,
                        disabled: true,
                        style: "width:100%",
                        onChange: lang.hitch(this, this._setCampoFuente)
                    }, "campoFuenteSelect");
                    this.__campoFuenteSelect.startup();

                    this.__campoDestinoSelect = new Select({
                        required: true,
                        disabled: true,
                        style: "width:100%",
                        onChange: lang.hitch(this, this._setCampoDestino)
                    }, "campoDestinoSelect");
                    this.__campoDestinoSelect.startup();

                    this.__addInterseccionButton = new Button({
                        label: "Agregar",
                        showLabel: true,
                        onClick: lang.hitch(this, this._addInterseccion)
                    }, "addInterseccionButton");
                    this.__addInterseccionButton.startup();

                    this.__deleteInterseccionButton = new Button({
                        label: "Eliminar",
                        showLabel: true,
                        onClick: lang.hitch(this, this._deleteInterseccion)
                    }, "deleteInterseccionButton");
                    this.__deleteInterseccionButton.startup();
                }
                catch (err) {
                    console.log(err);
                }
            },

            setValues() {
                var pointLayerOptions = [];
                var polygonLayerOptions = [];

                this.pointFeatureLayers.forEach(layer => {
                    pointLayerOptions.push({ label: layer.title, value: layer.title });
                });
                this.polygonFeatureLayers.forEach(layer => {
                    polygonLayerOptions.push({ label: layer.title, value: layer.title });
                })

                this.__capaDestinoSelect.options = pointLayerOptions;
                this.__capaOrigenSelect.options = polygonLayerOptions;
                this.__capaDestinoSelect.set("value", this.__tituloCapaDestino);

                if (this.__intersecciones.length > 0) {
                    this.__interseccion = this.__intersecciones[0];
                    this._setIntersecciones();
                }
            },

            _setNombreInterseccion: function (value) {
                console.log("_setNombreInterseccion")
                if (this.__interseccion != undefined) {
                    this.__interseccion.nombre = value;
                    this._setIntersecciones();
                }
            },

            _deleteInterseccion: function () {
                console.log("_deleteInterseccion")
                if (this.__interseccion != undefined) {
                    var index = this.__intersecciones.indexOf(this.__interseccion);
                    this.__intersecciones.splice(index, 1);
                    this.__interseccion = this.__intersecciones[index == 0 ? 0 : index - 1];
                    this._setIntersecciones();
                }
            },

            _addInterseccion: function () {
                console.log("_addInterseccion");
                var newLength = this.__intersecciones.length + 1;
                this.__intersecciones.push({
                    nombre: "Intersección #" + newLength,
                    campoDestino: "",
                    tituloCapaFuente: "",
                    campoFuente: ""
                });
                this.__interseccion = this.__intersecciones[newLength - 1];
                this._setIntersecciones();
            },

            _setCapaDestino: function (value) {
                console.log("_setCapaDestino")
                this.__tituloCapaDestino = value;
                var featureLayer = this.pointFeatureLayers.find(layer => {
                    return layer.title == value;
                });
                if (featureLayer != undefined) {
                    this._setCamposFecha(featureLayer);
                    this._setCamposLatitud(featureLayer);
                    this._setCamposLongitud(featureLayer);
                    this._setCamposDestino(featureLayer);
                }
            },

            _setInterseccion: function (value) {
                console.log("_setInterseccion(" + value + ")")
                this.__nombreInterseccionTextBox.set("value", value);
                this.__interseccion = this.__intersecciones.find(item => {
                    return item.nombre == value;
                })
                if (this.__interseccion != undefined) {
                    this.__capaOrigenSelect.setDisabled(false);
                    this.__campoFuenteSelect.setDisabled(false);
                    this.__campoDestinoSelect.setDisabled(false);

                    this.__capaOrigenSelect.set("value", this.__interseccion.tituloCapaFuente);
                    this.__campoDestinoSelect.set("value", this.__interseccion.campoDestino);
                }
            },

            _setIntersecciones: function () {
                console.log("_setIntersecciones")
                var interseccionesOptions = [];
                this.__intersecciones.forEach(item => {
                    interseccionesOptions.push({ value: item.nombre, label: item.nombre });
                })
                var optionsStore = new Memory({ data: interseccionesOptions, idProperty: 'value' });
                var store = new ObjectStore({ objectStore: optionsStore });

                this.__interseccionesSelect.setStore(store, null, null);
                if (this.__interseccion != undefined) {
                    this.__interseccionesSelect.set("value", this.__interseccion.nombre);
                    this.__nombreInterseccionTextBox.set("value", this.__interseccion.nombre);
                }
            },

            _setCapaOrigen: function (value) {
                console.log("_setCapaOrigen(" + value + ")")
                var featureLayer = this.polygonFeatureLayers.find(layer => {
                    return layer.title == value;
                });
                if (featureLayer != undefined) {
                    this._setCamposFuente(featureLayer);
                }
                if (this.__interseccion != undefined) {
                    this.__interseccion.tituloCapaFuente = value;
                    this.__campoFuenteSelect.set("value", this.__interseccion.campoFuente);
                }
            },

            _setCamposFuente: function (featureLayer) {
                console.log("_setCamposFuente")
                var options = this._getFieldNamesByType(featureLayer, "esriFieldTypeString");
                var optionsStore = new Memory({ data: options, idProperty: 'value' });
                var store = new ObjectStore({ objectStore: optionsStore });
                this.__campoFuenteSelect.setStore(store, null, null);
            },

            _setCamposFecha: function (featureLayer) {
                console.log("_setCamposFecha")
                var options = this._getFieldNamesByType(featureLayer, "esriFieldTypeDate");
                this.__campoFechaSelect.options = options;
                this.__campoFechaSelect.set("value", this.__campoFecha);
            },

            _setCamposLatitud: function (featureLayer) {
                console.log("_setCamposLatitud")
                var options = this._getFieldNamesByType(featureLayer, "esriFieldTypeString");
                this.__campoLatitudSelect.options = options;
                this.__campoLatitudSelect.set("value", this.__campoLatitud);
            },

            _setCamposLongitud: function (featureLayer) {
                console.log("_setCamposLongitud")
                var options = this._getFieldNamesByType(featureLayer, "esriFieldTypeString");
                this.__campoLongitudSelect.options = options;
                this.__campoLongitudSelect.set("value", this.__campoLongitud);
            },

            _setCamposDestino: function (featureLayer) {
                console.log("_setCamposDestino")
                var options = this._getFieldNamesByType(featureLayer, "esriFieldTypeString");
                this.__campoDestinoSelect.options = options;
            },

            _setCampoFuente: function (value) {
                console.log("_setCampoFuente(" + value + ")")
                if (this.__interseccion != undefined) {
                    this.__interseccion.campoFuente = value;
                }
            },

            _setCampoDestino: function (value) {
                console.log("_setCampoDestino(" + value + ")")
                if (this.__interseccion != undefined) {
                    this.__interseccion.campoDestino = value;
                }
            },

            _setCampoFecha: function (value) {
                console.log("_setCampoFecha(" + value + ")")
                this.__campoFecha = value;
            },

            _setCampoLatitud: function (value) {
                console.log("_setCampoLatitud(" + value + ")")
                this.__campoLatitud = value;
            },

            _setCampoLongitud: function (value) {
                console.log("_setCampoLongitud(" + value + ")")
                this.__campoLongitud = value;
            },

            _getFieldNamesByType(featureLayer, type) {
                var fieldList = [];
                featureLayer.popupInfo.fieldInfos.forEach(fi => {
                    if (fi.visible) {
                        var field = featureLayer.resourceInfo.fields.find(f => {
                            return f.name == fi.fieldName;
                        })
                        if (field != undefined) {
                            if (field.type == type) {
                                fieldList.push({ label: fi.label, value: field.name });
                            }
                        }
                    }
                });
                return fieldList;
            },
        });
    });