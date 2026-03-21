

export const context = createContext();

const contextProvider = (props) => {

    const onSent = async (props) => {
        runChat
    }
    const contextValue = {
        
    }
    return (
        <context.Provider value={contextValue}>
            {props.children}
        </context.Provider>
    )
}
export default contextProvider;