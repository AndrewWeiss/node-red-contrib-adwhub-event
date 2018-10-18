module.exports = function (RED) {

    var saveTasks = eventService();
    var updateTasks = eventService();
    var eventTasks = eventService();
    var cmdTasks = eventService();

    function eventService() {
        return {
            DispatchNodes: [],
            dispatch: function (msg) {
                for (var i = 0; i < this.DispatchNodes.length; i++) {
                    this.DispatchNodes[i].emit("input", msg);
                }
            },
            setTimeout: function (node, msg) {
                var self = this;
                setTimeout(function () {
                    try {
                        self.dispatch(msg);
                    } catch (err) {
                        node.error(err, {});
                    }
                }.bind(self), 0);
            },
            removeNode: function (node) {
                for (var i = 0; i < this.DispatchNodes.length; i++) {
                    if (this.DispatchNodes[i].id === node.id) {
                        this.DispatchNodes.splice(i, 1);
                    }
                }
            }
        }
    }

    
    function callSaveState(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        node.on("input", function (msg) {
            saveTasks.setTimeout(node, msg);
        });
    }
    RED.nodes.registerType("Do Save", callSaveState);
    

    function handleDeviceSave(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        saveTasks.DispatchNodes.push(node);
        node.on("input", function (msg) {
            node.send(msg);
            msg = null;
        });
        node.on("close", function () {
            saveTasks.removeNode(node);
        });
    }
    RED.nodes.registerType("Handle Save", handleDeviceSave);




    function callDeviceUpdate(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        node.on("input", function (msg) {
            updateTasks.setTimeout(node, msg);
        });
    }
    RED.nodes.registerType("Do Update", callDeviceUpdate);



    function handleDeviceUpdate(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        updateTasks.DispatchNodes.push(node);
        node.on("input", function (msg) {

            if (config.device && config.device !== msg.payload.device) {
                node.send(null);
                return;
            }

            if (config.sensor && config.sensor !== msg.payload.sensor) {
                node.send(null);
                return;
            }

            if (config.event && config.event !== msg.payload.event) {
                node.send(null);
                return;
            }

            node.send(msg);
            msg = null;
        });
        node.on("close", function () {
            updateTasks.removeNode(node);
        });
    }
    RED.nodes.registerType("Handle Update", handleDeviceUpdate);



    function callDeviceEvent(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.on("input", function (msg) {
            eventTasks.setTimeout(node, msg);
        });
    }
    RED.nodes.registerType("Do Event", callDeviceEvent);

    function handleDeviceEvent(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        eventTasks.DispatchNodes.push(node);

        node.on("input", function (msg) {

            if (config.device && config.device !== msg.payload.device) {
                node.send(null);
                return;
            }

            if (config.sensor && config.sensor !== msg.payload.sensor) {
                node.send(null);
                return;
            }

            if (config.event && config.event !== msg.payload.event) {
                node.send(null);
                return;
            }

            
            node.send(msg);
            msg = null;
        });
        
        node.on("close", function () {
            eventTasks.removeNode(node);
        });
    }
    RED.nodes.registerType("Handle Event", handleDeviceEvent);


    function callDeviceCmd(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.on("input", function (msg) {
            
            if(!(msg.payload !== null && typeof msg.payload === 'object'))
                msg.payload = {};

            msg.payload.device = config.device || msg.payload.device;
            msg.payload.sensor = config.sensor || msg.payload.sensor;
            msg.payload.cmd = config.cmd || msg.payload.cmd;
            cmdTasks.setTimeout(node, msg);
        });
    }
    RED.nodes.registerType("Do Cmd", callDeviceCmd);

    function handleDeviceCmd(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        cmdTasks.DispatchNodes.push(node);
        node.on("input", function (msg) {
            node.send(msg);
            msg = null;
        });
        node.on("close", function () {
            cmdTasks.removeNode(node);
        });
    }
    RED.nodes.registerType("Handle Cmd", handleDeviceCmd);
   
}