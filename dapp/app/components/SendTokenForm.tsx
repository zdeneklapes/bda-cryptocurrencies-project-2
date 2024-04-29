import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const SendTokensForm = () => {
    const formik = useFormik({
        initialValues: {
            receiverAddress: '',
            amount: '',
        },
        validationSchema: Yup.object({
            receiverAddress: Yup.string()
                .matches(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address")
                .required('Receiver address is required'),
            amount: Yup.number()
                .positive('Amount must be positive')
                .required('Amount is required'),
        }),
        onSubmit: values => {
            // Handle submission, e.g., send tokens
            console.log('Form values', values);
        },
    });

    return (
        <form onSubmit={formik.handleSubmit} style={formStyle}>
            <h2 style={{ textAlign: 'center' }}>Send Tokens</h2>
            <input
                type="text"
                name="receiverAddress"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.receiverAddress}
                style={inputStyle}
                placeholder="Receiver address e.g. 0xE9F9..."
            />
            {formik.touched.receiverAddress && formik.errors.receiverAddress ? (
                <div style={errorStyle}>{formik.errors.receiverAddress}</div>
            ) : null}
            <input
                type="text"
                name="amount"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.amount}
                style={inputStyle}
                placeholder="Amount e.g. 10"
            />
            {formik.touched.amount && formik.errors.amount ? (
                <div style={errorStyle}>{formik.errors.amount}</div>
            ) : null}
            <button type="submit" style={buttonStyle}>Send</button>
        </form>
    );
};

const formStyle = {
    backgroundColor: '#f3f4f6',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    maxWidth: '400px',
    margin: '20px auto',
};

const inputStyle = {
    width: '100%',
    padding: '10px',
    marginBottom: '10px',
    borderRadius: '4px',
    border: '1px solid #ccc',
};

const buttonStyle = {
    width: '100%',
    padding: '10px',
    backgroundColor: '#3182ce',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
};

const errorStyle = {
    color: 'red',
    marginBottom: '10px',
};

export default SendTokensForm;
