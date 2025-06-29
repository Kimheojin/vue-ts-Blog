import type ImageItem from "../data/ImageItem.ts";


export default class ImageListResponse {
    public success: boolean = false
    public message: string = ''
    public folder: string = ''
    public images: ImageItem[] = []
    public count: number = 0
}