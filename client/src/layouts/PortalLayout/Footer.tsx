import { GraduationCap, Mail, MapPin, Phone } from 'lucide-react'

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-gray-400 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                    <div className="flex items-center gap-2 mb-4 text-white">
                        <GraduationCap size={28} />
                        <span className="text-xl font-bold">EduCenter</span>
                    </div>
                    <p className="text-sm">
                        Đồng hành cùng sự phát triển toàn diện của học sinh. Mang đến môi trường giáo dục hiện đại và chuyên
                        nghiệp.
                    </p>
                </div>
                <div>
                    <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Hỗ trợ Phụ huynh</h4>
                    <ul className="space-y-2 text-sm">
                        <li>
                            <a href="#" className="hover:text-white transition-colors">
                                Hướng dẫn thanh toán
                            </a>
                        </li>
                        <li>
                            <a href="#" className="hover:text-white transition-colors">
                                Quy định học phí
                            </a>
                        </li>
                        <li>
                            <a href="#" className="hover:text-white transition-colors">
                                Câu hỏi thường gặp (FAQ)
                            </a>
                        </li>
                    </ul>
                </div>
                <div>
                    <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Liên hệ</h4>
                    <ul className="space-y-3 text-sm">
                        <li className="flex items-center gap-3">
                            <Phone size={16} /> 1900 1234 (Ext: 1 cho Kế toán)
                        </li>
                        <li className="flex items-center gap-3">
                            <Mail size={16} /> hotrophuhuynh@educenter.edu.vn
                        </li>
                        <li className="flex items-start gap-3">
                            <MapPin size={16} className="shrink-0 mt-1" /> 123 Đường ABC, Quận X, TP. Y
                        </li>
                    </ul>
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-gray-800 text-sm text-center">
                &copy; {new Date().getFullYear()} EduCenter. Đã đăng ký bản quyền.
            </div>
        </footer>
    )
}

export default Footer