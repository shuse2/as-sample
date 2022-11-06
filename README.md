## hello

### Consideration
- Unit of wasm compilation
    - Unit of update of the logic? (per module/command vs whole state machine)
    - To enable further protocol, what is necesssary?


### Problem
- scope of binding functions
    - module hook, method, endpoint and command has different scope requirement
    - how do we scope / differentiate them?
    - divide in function input and binding?
- how to provide metadata
    - every communication will be binary, especially for endpoint/command, how to we communicate / identify the params?
- How to differentiate which function can be called from other module, transaction?
    - Store list of function in the state?

### TODO
- auto-generate codec


### Idea
- Use decorator to identify command vs method vs endpoint?