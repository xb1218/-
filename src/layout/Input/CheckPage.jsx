import React, { useState, useEffect } from "react"
import styled from "@emotion/styled"
import { Space, Select } from "antd"
import { Link, useHistory, useLocation, useParams } from "react-router-dom"

const { Option } = Select

export default function CheckPage() {
  const { pathname } = useLocation()
  const id = pathname.split("/").pop()

  const [show, setShow] = useState(false)
  const [active, setActive] = useState("")

  useEffect(() => {
    const card = /id-card|officer|passport|marry|plan/g
    if (card.test(pathname)) {
      setShow(true)
      setActive(pathname.match(card)[0])
    }
  }, [])

  const list = [
    {
      toPoint: "id-card",
      label: "身份证",
    },
    {
      toPoint: "officer",
      label: "军官证",
    },
    {
      toPoint: "passport",
      label: "护照",
    },
    {
      toPoint: "marry",
      label: "结婚证",
    },
    {
      toPoint: "plan",
      label: "其他",
    },
  ]

  return (
    <>
      {show && (
        <SelOption>
          <Space size={16}>
            {list.map((e, index) => {
              return (
                <Link to={`/home/input/${e.toPoint}/${id}`} key={index} replace={true}>
                  <p
                    className={active == e.toPoint ? "active" : ""}
                    onClick={() => {
                      setActive(e.toPoint)
                    }}
                  >
                    {e.label}
                  </p>
                </Link>
              )
            })}
          </Space>
        </SelOption>
      )}
    </>
  )
}

const SelOption = styled.div`
  p {
    border-radius: 2px;
    border: 1px dashed #6986f4;
    padding: 2px 8px;
    color: #6986f4;
    cursor: pointer;
    margin: 0;
    transition: all 0.4s;
  }

  .active {
    border: 1px solid #6986f4;
    color: #fff;
    background-color: #6986f4;
  }
`
