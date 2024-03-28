// 'use client';
// import React, { useState, useCallback } from 'react';
// import axios from 'axios';
// import { GithubIcon } from 'lucide-react';

// import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
// import Modal from './Modal';
// import Heading from '../Heading';
// import Input from '../inputs/Input';
// import { toast } from 'sonner';
// import { Button } from '../ui/button';
// import useLoginModal from '@/app/hooks/useLoginModal';
// import { signIn } from 'next-auth/react';
// import { useRouter } from 'next/navigation';
// import useRegisterModal from '@/app/hooks/useRegisterModal';
// import Github from 'next-auth/providers/github';
// import IconButton from '../buttons/IconButton';

// const LoginModal = () => {
//   const loginModal = useLoginModal();
//   const registerModal = useRegisterModal();
//   const [isLoading, setIsLoading] = useState(false);
//   const router = useRouter();

//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm<FieldValues>({
//     defaultValues: {
//       email: '',
//       password: '',
//     },
//   });
//   const onSubmit: SubmitHandler<FieldValues> = async (data) => {
//     setIsLoading(true);
//     signIn('credentials', {
//       ...data,
//       redirect: false,
//     }).then((callback) => {
//       console.log(callback);
//       if (callback?.error) {
//         toast.error('Something went wrong');
//       } else {
//         toast.success('Logged in successfully');
//         router.refresh();

//         loginModal.onClose();
//       }
//     });
//   };

//   const toggle = useCallback(() => {
//     loginModal.onClose();
//     registerModal.onOpen();
//   }, [loginModal, registerModal]);
//   const bodyContent = (
//     <div className="flex flex-col gap-4">
//       <Heading title="Welcome back" subtitle="Log in to your account" />
//       <Input
//         id="email"
//         label="Email"
//         disabled={isLoading}
//         register={register}
//         errors={errors}
//         required
//       />
//       <Input
//         id="password"
//         type="password"
//         label="Password"
//         disabled={isLoading}
//         register={register}
//         errors={errors}
//         required
//       />
//     </div>
//   );

//   const footerContent = (
//     <div className="flex flex-col gap-4 mt-3">
//       <hr />
//       <IconButton
//         label="Continue with Google"
//         icon={FcGoogle}
//         onClick={() => signIn('google')}
//       />
//       <IconButton
//         outline
//         label="Continue with Github"
//         icon={GithubIcon}
//         onClick={() => signIn('github')}
//       />
//       <div className=" text-neutral-500 text0center mt04 font-light">
//         <div className=" justify-center flex flex-row items-center gap-2">
//           <div>{`Don't have an account?`} </div>
//           <div
//             className="text-neutral-800 cursor-pointer hover:underline"
//             onClick={toggle}
//           >
//             Create an account
//           </div>
//         </div>
//       </div>
//     </div>
//   );

//   return (
//     <Modal
//       disabled={isLoading}
//       title="Login"
//       actionLabel="Continue"
//       body={bodyContent}
//       footer={footerContent}
//       isOpen={loginModal.isOpen}
//       onClose={loginModal.onClose}
//       onSubmit={handleSubmit(onSubmit)}
//     />
//   );
// };

// export default LoginModal;
