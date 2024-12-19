
import createBox from "./createBox"

export type ProtectedBox = ReturnType<typeof createBox>
export type BoxData<T extends ProtectedBox> = ReturnType<T['getData']>
export type GetSnapshot<T extends ProtectedBox, D = BoxData<T>> = (data: D) => any


export default createBox

export {default as createSingleBox} from './createSingleBox'